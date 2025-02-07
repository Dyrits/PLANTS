import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";

import app from "./app.js";
import api from "./api.js";

// Mock the API module:
vi.mock("./api.js", () => ({
  default: {
    get: vi.fn()
  }
}));

describe("When sending a request to the /plants endpoint", () => {
  beforeAll(() => {
    process.env.API_TOKEN = "TOKEN";
    process.env.PORT = 3005;
  });

  beforeEach(() => {
    // Clear all mock call history before each test:
    vi.clearAllMocks();
  });

  it("should return 400 if the query parameter family_common_name is missing", async () => {
    const response = await request(app).get("/plants");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Missing required parameter: family_common_name | You can use %20 instead of whitespace."
    });
  });

  it("should return an array of plants on successful API call", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: [{ scientific_name: "Plantus Testus", year: 2020, id: 5, genus_id: 5 }]
      }
    });

    // Mock API responses for genus and species
    api.get.mockImplementation(url => {
      if (url === "/genus/5") {
        return Promise.resolve({ data: { data: { name: "Genus Testus" } } });
      }
      if (url === "/species/5") {
        return Promise.resolve({ data: { data: { observations: "Plantus Testus is not a real plant." } } });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const response = await request(app).get("/plants?family_common_name=TestFamily");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        scientific_name: "Plantus Testus",
        year: 2020,
        species_observation: "Plantus Testus is not a real plant.",
        genus_family_common_name: "Genus Testus"
      }
    ]);
  });

  it("should avoid duplicate API calls for genus and species requests", async () => {
    // Mock the initial /plants API response
    api.get.mockResolvedValueOnce({
      data: {
        data: [
          { scientific_name: "Plantus Testus #1", year: 2020, id: 5, genus_id: 5 },
          { scientific_name: "Plantus Testus #2", year: 2020, id: 5, genus_id: 5 },
          { scientific_name: "Plantus Testus #3", year: 2020, id: 5, genus_id: 5 },
          { scientific_name: "Plantus Testus #4", year: 2020, id: 5, genus_id: 5 },
          { scientific_name: "Plantus Testus #5", year: 2020, id: 10, genus_id: 10 }
        ]
      }
    });

    // Mock responses for /genus/{id} and /species/{id}
    api.get.mockImplementation(url => {
      if (url === "/genus/5") {
        return Promise.resolve({ data: { data: { name: "Genus Testus" } } });
      }
      if (url === "/species/5") {
        return Promise.resolve({ data: { data: { observations: "Plantus Testus is not a real plant." } } });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const response = await request(app).get("/plants?family_common_name=TestFamily");

    // Ensure the response is correct
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        scientific_name: "Plantus Testus #1",
        year: 2020,
        species_observation: "Plantus Testus is not a real plant.",
        genus_family_common_name: "Genus Testus"
      },
      {
        scientific_name: "Plantus Testus #2",
        year: 2020,
        species_observation: "Plantus Testus is not a real plant.",
        genus_family_common_name: "Genus Testus"
      },
      {
        scientific_name: "Plantus Testus #3",
        year: 2020,
        species_observation: "Plantus Testus is not a real plant.",
        genus_family_common_name: "Genus Testus"
      },
      {
        scientific_name: "Plantus Testus #4",
        year: 2020,
        species_observation: "Plantus Testus is not a real plant.",
        genus_family_common_name: "Genus Testus"
      },
      {
        scientific_name: "Plantus Testus #5",
        year: 2020,
        species_observation: "Unknown species",
        genus_family_common_name: "Unknown genus"
      }
    ]);

    expect(api.get).toHaveBeenCalledTimes(5); // One call for /plants, one for /genus/5, one for /species/5, one for /genus/10, and one for /species/10
  });

  it("should handle errors from the external API gracefully", async () => {
    // Mock API error
    api.get.mockRejectedValueOnce(new Error("API Error"));

    const response = await request(app).get("/plants?family_common_name=TestFamily");
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "An error occurred while fetching the plants."
    });
  });
});
