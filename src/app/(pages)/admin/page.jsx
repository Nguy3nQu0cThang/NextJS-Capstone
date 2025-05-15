"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, message, Spin } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import AdminUsersTable from "app/components/admin/AdminUsersTable"; // Thay UserAdmin bằng AdminUsersTable
import RoomAdmin from "app/components/admin/RoomAdmin";
import DashBoard from "app/components/admin/DashBoard";
import { useAuth } from "app/context/AuthContext";

const { Sider, Content } = Layout;

const AdminPage = () => {
  const [selectedKey, setSelectedKey] = useState("user");
  const { isLoggedIn, isCheckingAuth, isModalOpen } = useAuth();
  const router = useRouter();

  // Xử lý chuyển hướng khi không đăng nhập
  useEffect(() => {
    console.log("isCheckingAuth:", isCheckingAuth);
    console.log("isLoggedIn:", isLoggedIn);
    console.log("isModalOpen:", isModalOpen);
    if (!isCheckingAuth && !isLoggedIn && !isModalOpen) {
      console.log("Redirecting to home due to unauthorized access");
      message.error("Vui lòng đăng nhập để truy cập.");
      router.push("/");
    }
  }, [isCheckingAuth, isLoggedIn, isModalOpen, router]);

  // Xử lý chọn menu
  const handleMenuClick = ({ key }) => {
    console.log("Menu clicked:", key);
    setSelectedKey(key);
  };

  // Menu items
  const menuItems = [
    {
      key: "user",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
    },
    {
      key: "booking",
      icon: <CalendarOutlined />,
      label: "Quản lý đặt chỗ",
    },
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
  ];

  // Render component dựa trên menu được chọn
  const renderContent = () => {
    console.log("Rendering content for:", selectedKey);
    switch (selectedKey) {
      case "user":
        return <AdminUsersTable />; // Thay UserAdmin bằng AdminUsersTable
      case "booking":
        return <RoomAdmin />;
      case "dashboard":
        return <DashBoard />;
      default:
        return <AdminUsersTable />;
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{ textAlign: "center", margin: "50px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: "10px" }}>Đang kiểm tra xác thực...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Đợi chuyển hướng
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={250}
        style={{
          background: "#001529",
          position: "fixed",
          height: "100vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 20,
            fontWeight: "bold",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          Quản Lý
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ paddingTop: 16 }}
        />
      </Sider>
      <Layout style={{ marginLeft: 250 }}>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: "#f0f2f5",
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPage;
