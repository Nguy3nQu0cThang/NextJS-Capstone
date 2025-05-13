"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { message } from "antd";
import { http } from "app/utils/setting";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [authFailed, setAuthFailed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // ✅ Fix lỗi router.pathname

  const showModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setAuthFailed(false);
  };

  const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("userName");
    localStorage.removeItem("userProfile");
  };

  const checkAuthState = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const expiry = localStorage.getItem("tokenExpiry");
      const storedUserName = localStorage.getItem("userName");
      const storedProfile = localStorage.getItem("userProfile");

      if (
        !token ||
        token.split(".").length !== 3 ||
        !expiry ||
        !storedUserName ||
        new Date().getTime() >= parseInt(expiry)
      ) {
        clearAuthData();
        return false;
      }

      // Ưu tiên dùng userProfile trong localStorage nếu hợp lệ
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          if (
            profile &&
            profile.email &&
            profile.email.toLowerCase() === storedUserName.toLowerCase()
          ) {
            setUserProfile(profile);
            setUserName(storedUserName);
            setIsLoggedIn(true);
            return true;
          } else {
            localStorage.removeItem("userProfile"); // Xóa nếu không hợp lệ
          }
        } catch {
          localStorage.removeItem("userProfile");
        }
      }

      // Nếu không có profile hoặc không hợp lệ thì gọi API
      const res = await http.get("/api/users");
      if (res.data.statusCode === 200 && Array.isArray(res.data.content)) {
        const profile = res.data.content.find(
          (user) => user.email.toLowerCase() === storedUserName.toLowerCase()
        );
        if (profile) {
          setUserProfile(profile);
          setUserName(storedUserName);
          localStorage.setItem("userProfile", JSON.stringify(profile));
          setIsLoggedIn(true);
          return true;
        }
      }

      clearAuthData();
      return false;
    } catch (err) {
      console.error("Check auth error:", err.response?.data || err.message);
      clearAuthData();
      return false;
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const isValid = await checkAuthState();
      if (isMounted && !isValid) {
        setIsLoggedIn(false);
        setUserName("");
        setUserProfile(null);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuthState]);

  useEffect(() => {
    const handleAuthFailed = () => {
      clearAuthData();
      setIsLoggedIn(false);
      setUserName("");
      setUserProfile(null);
      setAuthFailed(true);
      router.push("/");
    };

    window.addEventListener("authFailed", handleAuthFailed);
    return () => window.removeEventListener("authFailed", handleAuthFailed);
  }, [router]);

  useEffect(() => {
    if (authFailed && pathname === "/") {
      showModal("login");
    }
  }, [authFailed, pathname]);

  const login = async (username, token, profile = null) => {
    try {
      if (!token || token.split(".").length !== 3) {
        throw new Error("Invalid token format");
      }

      const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("tokenExpiry", expiry.toString());
      localStorage.setItem("userName", username);

      if (profile) {
        setUserProfile(profile);
        localStorage.setItem("userProfile", JSON.stringify(profile));
      }

      setUserName(username);
      setIsLoggedIn(true);
      message.success("Đăng nhập thành công!");
      return true;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      clearAuthData();
      setIsLoggedIn(false);
      setUserName("");
      setUserProfile(null);
      message.error("Đăng nhập thất bại. Vui lòng thử lại.");
      return false;
    }
  };
  

  const logout = () => {
    clearAuthData();
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
        isCheckingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
