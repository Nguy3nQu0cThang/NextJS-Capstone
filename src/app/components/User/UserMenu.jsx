"use client";

import React from "react";
import { Dropdown, Button, Space } from "antd";
import { GlobalOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "app/context/AuthContext";

const UserMenu = ({ isLoggedIn, userName, showModal }) => {
  const router = useRouter();
  const { logout, userProfile } = useAuth();

  const handleMenuClick = ({ key }) => {
    if (key === "signup") {
      showModal("signup");
    } else if (key === "login") {
      showModal("login");
    } else if (key === "logout") {
      logout();
      console.log("Đã đăng xuất");
    } else if (key === "account") {
      router.push("/user/profile");
      console.log("Điều hướng đến trang thông tin tài khoản");
    } else if (key === "homepage") {
      router.push("/");
      console.log("Điều hướng đến trang chủ");
    } else if (key === "admin") {
      router.push("/admin");
      console.log("Điều hướng đến trang quản lý");
    }
  };

  const menuItems = isLoggedIn
    ? [
        { label: "Trang chủ", key: "homepage" },
        ...(userProfile?.role === "ADMIN"
          ? [{ label: "Quản lý", key: "admin" }]
          : []),
        { label: "Thông tin tài khoản", key: "account" },
        { label: "Đăng xuất", key: "logout", style: { color: "red" } },
      ]
    : [
        { label: "Đăng ký", key: "signup" },
        { label: "Đăng nhập", key: "login" },
      ];

  return (
    <div className="user-menu">
      <span className="booking-text">Booking</span>
      <GlobalOutlined className="global-icon" />
      {isLoggedIn && userName && <div className="user-name">{userName}</div>}
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={["click"]}
      >
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            <Button className="dropdown-button">
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
