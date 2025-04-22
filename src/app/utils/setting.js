import axios from "axios";
import { createBrowserHistory } from "history";

export const navigateHistory = createBrowserHistory();
export const TOKEN = "accessToken";
export const USER_LOGIN = "userLogin";

export function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
export function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
export function deleteCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

export const DOMAIN = "https://movienew.cybersoft.edu.vn";
export const TOKEN_CYBERSOFT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCBTw6FuZyAxNSIsIkhldEhhblN0cmluZyI6IjExLzA5LzIwMjUiLCJIZXRIYW5UaW1lIjoiMTc1NzU0ODgwMDAwMCIsIm5iZiI6MTczMzg1MDAwMCwiZXhwIjoxNzU3Njk2NDAwfQ.5vww18nCtO2mffvALHhzwa38Gyr82SqzU0hb0DLMGx0";

export const http = axios.create({
  baseURL: DOMAIN,
  timeout: 3000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN);
  config.headers = {
    ...config.headers,
    TokenCybersoft: TOKEN_CYBERSOFT,
  };
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const token = localStorage.getItem(TOKEN);

    if (token) {
      const jwtDecodeToken = decodeJWT(token);

      if (jwtDecodeToken) {
        const isExpired = isTokenExpired(token);

        if (isExpired) {
          try {
            const response = await axios({
              url: "https://apistore.cybersoft.edu.vn/api/Users/RefeshToken",
              method: "POST",
              headers: {
                Authorization: token,
                TokenCybersoft: TOKEN_CYBERSOFT,
              },
            });
            localStorage.setItem(TOKEN, response.data.content.accessToken);
            navigateHistory.push(window.location.pathname);
          } catch (err) {
            alert(err);
            navigateHistory.push("/login");
          }
        }
      }
    }

    switch (err?.response?.status) {
      case 400:
        {
          alert("sai tham số");

          navigateHistory.push("/");
        }
        break;

      case 404:
        {
          alert("đường dẫn không tồn tại");
          navigateHistory.push("/");
        }
        break;
      case 401:
        {
          navigateHistory.push("/login");
        }
        break;
      case 403:
        {
          alert("Yêu cầu quản trị viên mới có thể vào được");
          navigateHistory.push("/");
        }
        break;
      case 500:
        {
          alert("Lỗi hệ thống");
          navigateHistory.push("/");
        }
        break;
    }
    return Promise.reject(err);
  }
);

function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid JWT token:", e);
    return null;
  }
}

function isTokenExpired(token) {
  const decoded = decodeJWT(token);

  if (!decoded || !decoded.exp) {
    return true;
  }

  const expirationDate = new Date(decoded.exp * 1000);
  const currentDate = new Date();

  return expirationDate < currentDate;
}
