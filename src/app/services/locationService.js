import { http } from "app/utils/setting";

export const getAllLocations = async () => {
  try {
    const res = await http.get("/api/vi-tri");
    return res.data.content;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách vị trí:", err);
    return [];
  }
};

export const createLocation = (data) => {
  return http.post("/api/vi-tri", data);
};

export const updateLocation = (id, data) => {
  return http.put(`/api/vi-tri/${id}`, data);
};

export const deleteLocation = (id) => {
  return http.delete(`/api/vi-tri/${id}`);
};
