import { http } from "app/utils/setting"; 

const TOKEN_CYBERSOFT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCBTw6FuZyAxNSIsIkhldEhhblN0cmluZyI6IjExLzA5LzIwMjUiLCJIZXRIYW5UaW1lIjoiMTc1NzU0ODgwMDAwMCIsIm5iZiI6MTczMzg1MDAwMCwiZXhwIjoxNzU3Njk2NDAwfQ.5vww18nCtO2mffvALHhzwa38Gyr82SqzU0hb0DLMGx0";

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

export const getAllUsers = async () => {
  const res = await http.get("https://airbnbnew.cybersoft.edu.vn/api/users");
  return res.data.content;
};

