"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import dynamic from "next/dynamic";

const Login = dynamic(() => import("./Login"), { ssr: false });
const Register = dynamic(() => import("./Register"), { ssr: false });

const AuthModal = ({
  isModalOpen,
  modalMode,
  handleCancel,
  setModalMode,
  setIsModalOpen,
}) => {
  const [initialValues, setInitialValues] = useState({
    email: "",
    password: "",
  });

  // Lấy password từ localStorage khi modal login mở
  useEffect(() => {
    if (modalMode === "login") {
      const tempPassword = localStorage.getItem("tempPassword") || "";
      setInitialValues({
        email: localStorage.getItem("userName") || "",
        password: tempPassword,
      });
    }
  }, [modalMode]);

  // Xử lý khi login thành công
  const handleSuccessLogin = () => {
    // Xóa password sau khi đăng nhập thành công
    localStorage.removeItem("tempPassword");
    handleCancel(); // Đóng modal
    setIsModalOpen(false); // Đảm bảo modal đóng
  };

  // Xử lý khi register thành công
  const handleSuccessRegister = ({ switchToLogin, email, password }) => {
    handleCancel(); // Đóng modal Register
    setIsModalOpen(false); // Đóng modal hiện tại

    if (switchToLogin) {
      setInitialValues({ email, password }); // Lưu giá trị để điền vào form login
      setModalMode("login"); // Chuyển sang modal login
      setIsModalOpen(true); // Mở lại modal ngay lập tức
    }
  };

  return (
    <Modal
      title={modalMode === "login" ? "Đăng nhập" : "Đăng ký"}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden
    >
      {modalMode === "login" ? (
        <Login onSuccess={handleSuccessLogin} initialValues={initialValues} />
      ) : (
        <Register onSuccess={handleSuccessRegister} />
      )}
    </Modal>
  );
};

export default AuthModal;
