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
  return http.delete(`/api/phong-thue/${id}`);
};

export const getRoomReviews = (roomId) => {
  return http.get(`/api/binh-luan/lay-binh-luan-theo-phong/${roomId}`);
};

export const postRoomReview = (data) => {
  return http.post(`/api/binh-luan`, data);
};

export const getRoomsByLocation = (maViTri) => {
  return http.get("/api/phong-thue/lay-phong-theo-vi-tri", {
    params: { maViTri },
  });
};

export const getAllRoomsPaging = async (pageIndex, pageSize, keyword = "") => {
  const response = await http.get(
    `/api/phong-thue/phan-trang-tim-kiem?pageIndex=${pageIndex}&pageSize=${pageSize}&keyword=${keyword}`
  );
  return response.data;
};

