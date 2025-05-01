"use client";

import React from "react";
import { Dropdown, Button, Space } from "antd";
import { GlobalOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const UserMenu = ({
  isLoggedIn,
  userName,
  setIsLoggedIn,
  setUserName,
  showModal,
}) => {
  const router = useRouter()
  const handleMenuClick = ({ key }) => {
    if (key === "signup") {
      showModal("signup");
    } else if (key === "login") {
      showModal("login");
    } else if (key === "logout") {
      localStorage.removeItem("authToken");
      setIsLoggedIn(false);
      setUserName("");
    } else if (key === "account") {
      router.push("/user/profile")
      console.log("Điều hướng đến trang thông tin tài khoản");
    } else if (key === "homepage") {
      router.push("/")
      console.log("Điều hướng đến trang chủ")
    }
  };

  const menuItems = isLoggedIn
    ? [
        { label: "Trang chủ", key: "homepage" },
        { label: "Thông tin tài khoản", key: "account" },
        { label: "Đăng xuất", key: "logout", style: { color: "red" } },
      ]
    : [
        { label: "Đăng ký", key: "signup" },
        { label: "Đăng nhập", key: "login" },
      ];

  return (
    <div
      style={{
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        maxWidth: "300px",
      }}
    >
      <span style={{ cursor: "pointer", fontSize: "14px" }}>Booking</span>
      <GlobalOutlined style={{ fontSize: "16px", cursor: "pointer" }} />
      {userName && (
        <div
          style={{
            maxWidth: "150px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {userName}
        </div>
      )}
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={["click"]}
      >
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            <Button style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MenuOutlined />
              <UserOutlined />
            </Button>
          </Space>
        </a>
      </Dropdown>
    </div>
  );
};

export default UserMenu;
