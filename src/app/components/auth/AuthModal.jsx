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
}) => {
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
            setIsModalOpen(false);
          }}
        />
      ) : (
        <Register
          onSuccess={(options) => {
            setIsModalOpen(false);
            if (options.switchToLogin) {
              setTimeout(() => {
                setModalMode("login");
                setIsModalOpen(true);
              }, 0);
            }
          }}
        />
      )}
    </Modal>
  );
};

export default AuthModal;
