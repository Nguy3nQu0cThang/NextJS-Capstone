"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Avatar, Descriptions, Alert, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { showModal } = useAuth();

  const getProfileAPI = async () => {
    const token = localStorage.getItem("accessToken");
    console.log("Token:", token);
    if (!token) {
      setError("Vui lòng đăng nhập để xem hồ sơ.");
      setLoading(false);
      router.push("/");
      showModal("login");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        "https://apistore.cybersoft.edu.vn/api/Users/getProfile",
        {},
        {
          headers: {
            Authorization: token,
            TokenCybersoft:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCBTw6FuZyAxNSIsIkhldEhhblN0cmluZyI6IjExLzA5LzIwMjUiLCJIZXRIYW5UaW1lIjoiMTc1NzU0ODgwMDAwMCIsIm5iZiI6MTczMzg1MDAwMCwiZXhwIjoxNzU3Njk2NDAwfQ.5vww18nCtO2mffvALHhzwa38Gyr82SqzU0hb0DLMGx0",
          },
        }
      );
      console.log("API Response:", res.data);
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
      console.error("API Error:", err.response?.status, err.response?.data);
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

  console.log("profile:", profile);

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
