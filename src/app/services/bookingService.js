import axios from "axios";

const BASE_URL = "https://airbnbnew.cybersoft.edu.vn/api";
const TOKEN_CYBERSOFT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCBTw6FuZyAxNSIsIkhldEhhblN0cmluZyI6IjExLzA5LzIwMjUiLCJIZXRIYW5UaW1lIjoiMTc1NzU0ODgwMDAwMCIsIm5iZiI6MTczMzg1MDAwMCwiZXhwIjoxNzU3Njk2NDAwfQ.5vww18nCtO2mffvALHhzwa38Gyr82SqzU0hb0DLMGx0";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    TokenCybersoft: TOKEN_CYBERSOFT,
  },
});

export const getListLocations = () => {
  return api.get("/vi-tri");
};

export const getAllLocations = async () => {
  const res = await api.get("/vi-tri");
  return res.data; // res.data = { statusCode, content, ... }
};

export const getRoomsByLocation = (maViTri) => {
  return api.get(`/phong-thue/lay-phong-theo-vi-tri`, {
    params: { maViTri },
  });
};
