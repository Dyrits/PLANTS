import express from "express";
import { configDotenv } from "dotenv";

import api from "./api.js";

configDotenv();

const app = express();

app.use(express.json());

app.get("/plants", async (request, response) => {
  const { family_common_name } = request.query;

  if (!family_common_name) {
    return response
      .status(400)
      .json({ error: "Missing required parameter: family_common_name | You can use %20 instead of whitespace." });
  }

  // Create an object to store the additional details we need to fetch for each plant.
  const details = {
    genus: {},
    observations: {}
  };

  try {
    const { data } = await api.get("/plants", {
      params: { filter: { family_common_name }, page: 1 }
    });

    let plants = await Promise.all(
      data.data.map(async ({ scientific_name, year, id, genus_id }) => {
        // Initialize the details object with empty strings for each genus and species (to have all the unique identifiers as keys).
        details.genus[genus_id] = "";
        details.observations[id] = "";
        return {
          scientific_name,
          year,
          // Temporarily store the identifiers for the genus and species to assign the correct values later.
          genus_family_common_name: genus_id,
          species_observation: id
        };
      })
    );

    // There is no API route to fetch multiple genus or species by identifier, so we have to make individual requests.
    // A library like p-limit could be used to limit the number of concurrent requests.
    await Promise.all([
      ...Object.keys(details.genus).map(id =>
        api
          .get(`/genus/${id}`)
          .then(({ data }) => {
            details.genus[id] = data.data.name;
          })
          .catch(error => {
            console.error(`Failed to fetch genus with ID ${id}:`, error);
            details.genus[id] = "Unknown genus";
          })
      ),
      ...Object.keys(details.observations).map(id =>
        api
          .get(`/species/${id}`)
          .then(({ data }) => {
            details.observations[id] = data.data.observations || "No observations available";
          })
          .catch(error => {
            console.error(`Failed to fetch species with ID ${id}:`, error);
            details.observations[id] = "Unknown species";
          })
      )
    ]);

    // Having fetched the details, we can now map the plants array to include the genus and species information (in constant time).
    plants = plants.map(plant => ({
      ...plant,
      genus_family_common_name: details.genus[plant.genus_family_common_name],
      species_observation: details.observations[plant.species_observation]
    }));

    response.status(200).json(plants);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "An error occurred while fetching the plants." });
  }
});

export default app;
