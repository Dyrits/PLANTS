import axios from "axios";

const API_URL = "https://trefle.io/api/v1/";
const API_TOKEN = process.env.API_TOKEN;

const api = axios.create({
  baseURL: API_URL,
  params: {
    token: API_TOKEN
  }
});

export default api;
