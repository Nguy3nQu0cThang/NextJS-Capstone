"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { http } from "app/utils/setting";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [authFailed, setAuthFailed] = useState(false); // Thêm state để theo dõi authFailed
  const router = useRouter();

  const showModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setAuthFailed(false); // Reset authFailed khi đóng modal
  };

  const checkAuthState = () => {
    console.log("Checking auth state on load");
    const token = localStorage.getItem("accessToken");
    const expiry = localStorage.getItem("tokenExpiry");
    const storedUserName = localStorage.getItem("userName");
    const storedProfile = localStorage.getItem("userProfile");

    console.log(
      "Token:",
      token,
      "Expiry:",
      expiry,
      "UserName:",
      storedUserName
    );

    if (token && expiry && storedUserName && storedProfile) {
      const now = new Date().getTime();
      if (now < parseInt(expiry)) {
        try {
          const user = JSON.parse(atob(token.split(".")[1]));
          setUserName(
            user[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
            ] || storedUserName
          );
          setUserProfile(JSON.parse(storedProfile));
          setIsLoggedIn(true);
          return true;
        } catch (error) {
          console.error("Lỗi giải mã token:", error);
        }
      }
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("userName");
    localStorage.removeItem("userProfile");
    setIsLoggedIn(false);
    setUserName("");
    setUserProfile(null);
    return false;
  };

  useEffect(() => {
    const handleAuthFailed = () => {
      console.log("Received authFailed event");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("userName");
      localStorage.removeItem("userProfile");
      setIsLoggedIn(false);
      setUserName("");
      setUserProfile(null);
      setAuthFailed(true); // Đánh dấu authFailed
      router.push("/");
    };
    window.addEventListener("authFailed", handleAuthFailed);
    return () => window.removeEventListener("authFailed", handleAuthFailed);
  }, [router]);

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    // Mở modal đăng nhập sau khi chuyển hướng về /
    if (authFailed && router.pathname === "/") {
      showModal("login");
    }
  }, [authFailed, router.pathname]);

  const login = async (username, token) => {
    try {
      const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("tokenExpiry", expiry.toString());
      localStorage.setItem("userName", username);

      const res = await http.post("/api/Users/getProfile", {});
      console.log("Login getProfile response:", res.data);
      if (res.data.statusCode === 200 && res.data.content) {
        setUserProfile(res.data.content);
        localStorage.setItem("userProfile", JSON.stringify(res.data.content));
        setIsLoggedIn(true);
        setUserName(username);
        message.success("Đăng nhập thành công!");
      } else {
        throw new Error("Không thể lấy thông tin hồ sơ.");
      }
    } catch (err) {
      console.error("Login error:", err);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("userName");
      localStorage.removeItem("userProfile");
      setIsLoggedIn(false);
      setUserName("");
      setUserProfile(null);
      message.error("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("userName");
    localStorage.removeItem("userProfile");
    setIsLoggedIn(false);
    setUserName("");
    setUserProfile(null);
    message.success("Đăng xuất thành công!");
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        userName,
        setUserName,
        userProfile,
        setUserProfile,
        showModal,
        isModalOpen,
        setIsModalOpen,
        modalMode,
        setModalMode,
        handleCancel,
        login,
        logout,
        checkAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
