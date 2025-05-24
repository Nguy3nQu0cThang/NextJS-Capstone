"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, message, Spin, Grid } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import AdminUsersTable from "app/components/admin/AdminUsersTable";
import RoomAdmin from "app/components/admin/RoomAdmin";
import DashBoard from "app/components/admin/DashBoard";
import { useAuth } from "app/context/AuthContext";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const AdminPage = () => {
  const [selectedKey, setSelectedKey] = useState("user");
  const [collapsed, setCollapsed] = useState(false);
  const { isLoggedIn, isCheckingAuth, isModalOpen } = useAuth();
  const router = useRouter();
  const screens = useBreakpoint(); 

  // Collapse menu nếu màn hình nhỏ hơn md
  useEffect(() => {
    setCollapsed(!screens.md);
  }, [screens]);

  useEffect(() => {
    if (!isCheckingAuth && !isLoggedIn && !isModalOpen) {
      message.error("Vui lòng đăng nhập để truy cập.");
      router.push("/");
    }
  }, [isCheckingAuth, isLoggedIn, isModalOpen, router]);

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  const menuItems = [
    {
      key: "user",
      icon: <UserOutlined />,
      label: collapsed ? null : "Quản lý người dùng",
    },
    {
      key: "booking",
      icon: <CalendarOutlined />,
      label: collapsed ? null : "Quản lý đặt chỗ",
    },
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: collapsed ? null : "Dashboard",
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case "user":
        return <AdminUsersTable />;
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
    return null;
  }

  return (
    <Layout
      style={{ minHeight: "100vh", display: "flex", flexDirection: "row" }}
    >
      <Sider
        width="20%"
        collapsedWidth="80"
        collapsible
        collapsed={collapsed}
        style={{
          background: "#001529",
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
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {!collapsed ? "Quản Lý" : "QL"}
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
      <Layout style={{ width: collapsed ? "calc(100% - 80px)" : "80%" }}>
        <Content
          style={{
            padding: 24,
            minHeight: 280,
            background: "#f0f2f5",
            transition: "all 0.3s",
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPage;
