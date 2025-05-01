"use client";

import React from "react";
import { Modal } from "antd";
import dynamic from "next/dynamic";

const Login = dynamic(() => import("./Login"), { ssr: false });
const Register = dynamic(() => import("./Register"), { ssr: false });

const AuthModal = ({
  isModalOpen,
  modalMode,
  handleCancel,
  setIsModalOpen,
  setModalMode,
  setIsLoggedIn,
  setUserName,
}) => {
  console.log(
    "Rendering AuthModal, modalMode:",
    modalMode,
    "isModalOpen:",
    isModalOpen
  );
  return (
    <Modal
      title={modalMode === "login" ? "Đăng nhập" : "Đăng ký"}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      {modalMode === "login" ? (
        <Login
          onSuccess={(username) => {
            console.log("Login onSuccess:", username);
            setIsModalOpen(false);
            setIsLoggedIn(true);
            setUserName(username);
          }}
        />
      ) : (
        <Register
          onSuccess={(options) => {
            console.log("Register onSuccess:", options);
            setIsModalOpen(false);
            if (options.switchToLogin) {
              setTimeout(() => {
                setModalMode("login");
                setIsModalOpen(true);
                console.log("Chuyển sang modal Login");
              }, 0);
            }
          }}
        />
      )}
    </Modal>
  );
};

export default AuthModal;
