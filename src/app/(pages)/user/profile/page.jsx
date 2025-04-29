"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Avatar, Descriptions, Alert, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { http } from "app/utils/setting";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { showModal } = useAuth();

  const getProfileAPI = async () => {
    const token = localStorage.getItem("accessToken");
    console.log("Token:", token); // Debug token
    if (!token) {
      setError("Vui lòng đăng nhập để xem hồ sơ.");
      setLoading(false);
      router.push("/");
      showModal("login");
      return;
    }
    try {
      setLoading(true);
      const res = await http.post("/api/Users/getProfile", {}); // Sử dụng baseURL
      console.log("API Response:", res.data); // Debug response
      if (res.data.statusCode === 200) {
        if (res.data.content) {
          setProfile(res.data.content);
        } else {
          setError("Không có thông tin hồ sơ để hiển thị.");
        }
      } else {
        setError("Không thể lấy thông tin hồ sơ.");
      }
      setLoading(false);
    } catch (err) {
      console.error("API Error:", err.response?.status, err.response?.data); // Debug lỗi
      const status = err.response?.status;
      if (status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("accessToken");
        router.push("/");
        showModal("login");
      } else if (status === 403) {
        setError("Bạn không có quyền truy cập hồ sơ.");
        setLoading(false);
      } else if (status === 400) {
        setError("Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.");
        setLoading(false);
      } else {
        setError("Lỗi server. Vui lòng thử lại sau.");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getProfileAPI();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", margin: "50px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: "10px" }}>Đang tải thông tin...</p>
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" style={{ margin: "20px" }} />;
  }

  if (!profile) {
    return (
      <Alert
        message="Không có thông tin hồ sơ để hiển thị."
        type="warning"
        style={{ margin: "20px" }}
      />
    );
  }

  console.log("profile:", profile); // Debug profile

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Card
        title="Thông tin hồ sơ"
        variant="borderless"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Avatar
            size={100}
            src={profile.avatar || undefined}
            icon={<UserOutlined />}
            style={{ border: "2px solid #1890ff" }}
          />
          <h2 style={{ marginTop: "10px" }}>
            {profile.name || "Chưa cung cấp"}
          </h2>
        </div>
        <Descriptions bordered column={1} styles={{ label: { width: "30%" } }}>
          <Descriptions.Item label="Họ và tên">
            {profile.name || "Chưa cung cấp"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {profile.email || "Chưa cung cấp"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {profile.phone || "Chưa cung cấp"}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {profile.gender ? "Nam" : "Nữ"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default UserProfile;
