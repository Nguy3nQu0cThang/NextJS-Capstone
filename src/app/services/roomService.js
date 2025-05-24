import axios from "axios";

const BASE_URL = "https://airbnbnew.cybersoft.edu.vn/api";
const TOKEN_CYBERSOFT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCBTw6FuZyAxNSIsIkhldEhhblN0cmluZyI6IjExLzA5LzIwMjUiLCJIZXRIYW5UaW1lIjoiMTc1NzU0ODgwMDAwMCIsIm5iZiI6MTczMzg1MDAwMCwiZXhwIjoxNzU3Njk2NDAwfQ.5vww18nCtO2mffvALHhzwa38Gyr82SqzU0hb0DLMGx0";

export const getAllRooms = () => {
  return axios.get(`${BASE_URL}/phong-thue`, {
    headers: {
      TokenCybersoft: TOKEN_CYBERSOFT,
    },
  });
};
export const getAllRoomsDashboard = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/phong-thue`, {
      headers: {
        TokenCybersoft: TOKEN_CYBERSOFT,
      },
    });
    return res.data.content;
  } catch (error) {
    console.error("Lỗi khi gọi API /phong-thue:", error);
    return [];
  }
};

export const getRoomDetail = (id) => {
  return axios.get(`${BASE_URL}/phong-thue/${id}`, {
    headers: {
      TokenCybersoft: TOKEN_CYBERSOFT,
    },
  });
};

export const getRoomReviews = (roomId) => {
  return axios.get(`${BASE_URL}/binh-luan/lay-binh-luan-theo-phong`, {
    params: { maPhong: roomId },
    headers: {
      TokenCybersoft: TOKEN_CYBERSOFT,
    },
  });
};
