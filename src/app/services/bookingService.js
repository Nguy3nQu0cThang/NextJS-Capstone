import { http } from "../utils/setting";

export const getListLocations = () => {
  return http.get("/api/vi-tri");
};

export const getAllLocations = async () => {
  const res = await http.get("/api/vi-tri");
  return res.data;
};

export const getAllLocationsDashboard = async () => {
  const res = await http.get("/api/vi-tri");
  return res.data.content;
};

export const getLocationById = async (locationId) => {
  try {
    const res = await http.get(`/api/vi-tri/${locationId}`);
    return res.data.content; // Giả định API trả về content chứa dữ liệu vị trí
  } catch (err) {
    console.error(
      `Lỗi lấy vị trí theo ID ${locationId}:`,
      err.response?.data || err.message
    );
    throw err;
  }
};

export const bookRoom = async (data) => {
  try {
    const res = await http.post(`/api/dat-phong`, data);
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
  const response = await http.get("/api/dat-phong");
  return response.data.content;
};

export const getBookingsByUser = (userId) => {
  return http.get(`/api/dat-phong/lay-theo-nguoi-dung/${userId}`);
};

export const updateRoom = async (roomId, payload) => {
  return await http.put(`/api/phong-thue/${roomId}`, payload);
};

export const uploadRoomImage = async (roomId, formData) => {
  try {
    const res = await http.post(
      `/api/phong-thue/upload-hinh-phong?maPhong=${roomId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Lỗi uploadRoomImage:", err.response?.data || err.message);
    throw err;
  }
};
