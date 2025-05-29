import { http } from "app/utils/setting";
export const createRoom = (data) => {
  return http.post("/api/phong-thue", data); 
};

export const getAllRooms = () => {
  return http.get("/api/phong-thue");
};

export const getAllRoomsDashboard = async () => {
  try {
    const res = await http.get("/api/phong-thue");
    return res.data.content;
  } catch (error) {
    console.error("Lỗi khi gọi API /phong-thue:", error);
    return [];
  }
};

export const getRoomDetail = (id) => {
  return http.get(`/api/phong-thue/${id}`);
};

export const deleteRoomById = (id) => {
  return http.delete(`/phong-thue/${id}`);
};

export const updateRoomById = (id, data) => {
  return http.put(`/phong-thue/${id}`, data);
};

export const getRoomReviews = (roomId) => {
  return http.get(`/api/binh-luan/lay-binh-luan-theo-phong/${roomId}`);
};

export const postRoomReview = (data) => {
  const token = localStorage.getItem("token");
  console.log("TOKEN gửi đi:", token);
  return http.post("https://airbnbnew.cybersoft.edu.vn/api/binh-luan", data, {
    headers: {
      TokenCybersoft: TOKEN_CYBERSOFT,
      token: token,
    },
  });
};