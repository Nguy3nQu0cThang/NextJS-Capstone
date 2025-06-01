import { http } from "app/utils/setting"; 

export const deleteAccount = async (userId) => {
  try {
    const res = await http.delete(
      `/api/users?id=${userId}`
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

export const getAllUsers = async () => {
  const res = await http.get(`/api/users`);
  return res.data.content;
};
export const getAllUsersPaging = async (
  pageIndex = 1,
  pageSize = 10,
  keyword = ""
) => {
  try {
    const response = await http.get(
      `/api/users/phan-trang-tim-kiem?pageIndex=${pageIndex}&pageSize=${pageSize}&keyword=${keyword}`
    );
    return response.data; // Giả định response.data chứa { content: [...users], totalRow: totalCount }
  } catch (err) {
    console.error(
      `Lỗi khi tải người dùng theo trang (trang ${pageIndex}, kích thước ${pageSize}, từ khóa: ${keyword}):`,
      err.response?.data || err.message
    );
    throw err;
  }
};

export const getUserDetail = (id) => {
  return http.get(`/api/users/${id}`);
};

