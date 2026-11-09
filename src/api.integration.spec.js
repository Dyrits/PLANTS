import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "node:http";
import { once } from "node:events";
import app from "./app.js";
import api from "./api.js";

let fixture, server, origin;
const requests = [];
const originalBaseURL = api.defaults.baseURL;
beforeAll(async () => {
  fixture = createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    requests.push(url);
    response.setHeader("content-type", "application/json");
    if (url.pathname === "/plants") {
      response.end(JSON.stringify({ data: [{ id: 5, genus_id: 7, scientific_name: "Fixture plant", year: 2026 }] }));
    } else if (url.pathname === "/genus/7") {
      response.end(JSON.stringify({ data: { name: "Fixture genus" } }));
    } else if (url.pathname === "/species/5") {
      response.end(JSON.stringify({ data: { observations: "Fixture observation" } }));
    } else {
      response.statusCode = 404;
      response.end("{}");
    }
  }).listen(0, "127.0.0.1");
  await once(fixture, "listening");
  api.defaults.baseURL = `http://127.0.0.1:${fixture.address().port}`;
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  origin = `http://127.0.0.1:${server.address().port}`;
});
afterAll(async () => {
  api.defaults.baseURL = originalBaseURL;
  await Promise.all([server, fixture].map(s => new Promise((resolve, reject) => s.close(e => e ? reject(e) : resolve()))));
});
describe("real HTTP and Axios compatibility", () => {
  it("serializes the family filter and combines real HTTP detail responses", async () => {
    const response = await fetch(`${origin}/plants?family_common_name=Rose%20family`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ scientific_name: "Fixture plant", year: 2026, genus_family_common_name: "Fixture genus", species_observation: "Fixture observation" }]);
    expect(requests[0].searchParams.get("filter[family_common_name]")).toBe("Rose family");
    expect(requests[0].searchParams.get("page")).toBe("1");
    expect(requests.map(u => u.pathname).sort()).toEqual(["/genus/7", "/plants", "/species/5"]);
  });
  it("rejects missing filters and malformed JSON and remains responsive", async () => {
    expect((await fetch(`${origin}/plants`)).status).toBe(400);
    expect((await fetch(`${origin}/plants`, { method: "POST", headers: { "content-type": "application/json" }, body: "{" })).status).toBe(400);
    expect((await fetch(`${origin}/plants`)).status).toBe(400);
  });
});
