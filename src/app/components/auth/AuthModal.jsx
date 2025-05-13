"use client";

import React from "react";
import { Modal } from "antd";
import dynamic from "next/dynamic";

const Login = dynamic(() => import("./Login"), { ssr: false });
const Register = dynamic(() => import("./Register"), { ssr: false });

const AuthModal = ({ isModalOpen, modalMode, handleCancel, setModalMode }) => {
  const handleSuccessLogin = () => {
    handleCancel(); // Đóng modal
  };

  const handleSuccessRegister = (options) => {
    handleCancel(); // Đóng modal
    if (options?.switchToLogin) {
      setTimeout(() => {
        setModalMode("login");
      }, 0);
    }
  };

  return (
    <Modal
      title={modalMode === "login" ? "Đăng nhập" : "Đăng ký"}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      {modalMode === "login" ? (
        <Login onSuccess={handleSuccessLogin} />
      ) : (
        <Register onSuccess={handleSuccessRegister} />
      )}
    </Modal>
  );
};

export default AuthModal;
