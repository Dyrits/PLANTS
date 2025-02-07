import { AugmentedRequest, CacheOptions, RESTDataSource } from "@apollo/datasource-rest";
import { ValueOrPromise } from "@apollo/datasource-rest/dist/RESTDataSource";

class TrefleAPI extends RESTDataSource {
  override baseURL = "https://trefle.io/api/v1/";

  async getPlants(family_common_name: string) {
    const data = await this.get("plants", { params: { "filter[family_common_name]": family_common_name, page: "1" } });
    return data.data;
  }

  async getGenusName(id: number): Promise<string> {
    const data = await this.get(`genus/${id}`);
    return data.data.name;
  }

  async getSpeciesObservation(id: number): Promise<string> {
    const data = await this.get(`species/${id}`);
    return data.data.observations;
  }

  protected willSendRequest(path: string, requestOpts: AugmentedRequest<CacheOptions>): ValueOrPromise<void> {
    requestOpts.params.set("token", process.env.API_TOKEN);
  }
}

export default TrefleAPI;
