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
  return res.data;
};

export const getAllLocationsDashboard = async () => {
  const res = await api.get("/vi-tri");
  return res.data.content;
};

export const getRoomsByLocation = (maViTri) => {
  return api.get(`/phong-thue/lay-phong-theo-vi-tri`, {
    params: { maViTri },
  });
};

export const getAllRoomsPaging = async (pageIndex, pageSize, keyword = "") => {
  const response = await api.get(
    `/phong-thue/phan-trang-tim-kiem?pageIndex=${pageIndex}&pageSize=${pageSize}&keyword=${keyword}`
  );
  return response.data;
};

export const deleteRoomById = async (roomId) => {
  const response = await api.delete(`/phong-thue/${roomId}`);
  return response.data;
};

export const bookRoom = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/dat-phong`, data, {
      headers: {
        TokenCybersoft: TOKEN_CYBERSOFT,
      },
    });
    if (res.data.statusCode !== 201) {
      throw new Error(res.data.message || "Đặt phòng thất bại");
    }

    return res.data;
  } catch (err) {
    console.error("Lỗi API bookRoom:", err.response?.data || err.message);
    throw err;
  }
};

export const getAllBookings = async () => {
  const response = await api.get("/dat-phong");
  return response.data.content;
};

export const getBookingsByUser = (userId) => {
  return api.get(`${BASE_URL}/dat-phong/lay-theo-nguoi-dung/${userId}`);
};