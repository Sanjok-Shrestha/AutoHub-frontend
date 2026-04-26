import axios from "axios";

const API = axios.create({
  baseURL: "https://localhost:7287/api"
});

export default API;