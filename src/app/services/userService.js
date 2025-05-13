import { http } from "app/utils/setting"; // Đảm bảo bạn đang sử dụng đúng http instance của bạn

export const deleteAccount = async (userId) => {
  try {
    const res = await http.delete(
      `https://airbnbnew.cybersoft.edu.vn/api/users?id=${userId}`
    );
    const { statusCode, content } = res.data;
    if (statusCode === 200) {
      return content; // Trả về thông tin phản hồi nếu thành công
    }
    throw new Error("Xóa tài khoản không thành công.");
  } catch (err) {
    throw new Error(
      err.response?.data || err.message || "Lỗi khi xóa tài khoản."
    );
  }
};
