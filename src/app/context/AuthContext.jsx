"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("");

  const showModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const user = JSON.parse(atob(token.split(".")[1]));
        setUserName(
          user[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ] || ""
        );
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        userName,
        setUserName,
        showModal,
        isModalOpen,
        setIsModalOpen,
        modalMode,
        setModalMode,
        handleCancel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
