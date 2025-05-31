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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState(null); // Thêm state tìm kiếm
  const router = useRouter();
  const pathname = usePathname();

  const showModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const clearAuthData = () => {
    console.log("Clearing auth data...");
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("userName");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("user");
    localStorage.removeItem("tempPassword");
    setIsLoggedIn(false);
    setUserName("");
    setUserProfile(null);
    console.log("Auth data cleared:", { isLoggedIn, userName, userProfile });
  };

  const checkAuthState = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const expiry = localStorage.getItem("tokenExpiry");
      const storedUserName = localStorage.getItem("userName");
      const storedProfile = localStorage.getItem("userProfile");

      console.log("Checking auth state:", { token, expiry, storedUserName });

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
            localStorage.removeItem("userProfile");
          }
        } catch {
          localStorage.removeItem("userProfile");
        }
      }

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

  const login = async (username, token, profile = null) => {
    try {
      if (!token || token.split(".").length !== 3) {
        throw new Error("Invalid token format");
      }

      const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem("token", token);
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
      message.error("Đăng nhập thất bại. Vui lòng thử lại.");
      return false;
    }
  };

  const logout = async () => {
    try {
      clearAuthData();
      message.success("Đăng xuất thành công!");
      await checkAuthState();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      message.error("Đăng xuất thất bại. Vui lòng thử lại.");
    }
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
        clearAuthData,
        isCheckingAuth,
        selectedLocationId, // Cung cấp state tìm kiếm
        setSelectedLocationId, // Cung cấp setter cho state tìm kiếm
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
