"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Avatar, Descriptions, Alert, Spin, Button, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { http } from "app/utils/setting";
import UpdateProfile from "app/components/User/UpdateProfile";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const { userProfile, setUserProfile, checkAuthState, showModal } = useAuth();

  const getProfileAPI = async () => {
    try {
      setLoading(true);
      const isAuthenticated = await checkAuthState();
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to /");
        router.push("/");
        return;
      }

      if (userProfile) {
        console.log("Using cached userProfile:", userProfile);
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await http.post(
        "/api/Users/getProfile",
        {},
        {
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      console.log("API Response:", res.data);
      if (res.data.statusCode === 200 && res.data.content) {
        setUserProfile(res.data.content);
        localStorage.setItem("userProfile", JSON.stringify(res.data.content));
      } else {
        setError("Không có thông tin hồ sơ để hiển thị.");
      }
      setLoading(false);
    } catch (err) {
      console.error("API Error:", err.response?.status, err.response?.data);
      if (err.name === "AbortError") {
        setError("Yêu cầu quá lâu, vui lòng thử lại.");
      } else if (err.response?.status === 401) {
        router.push("/"); // Chuyển hướng, dựa vào AuthContext để mở modal
      } else if (err.response?.status === 403) {
        setError("Bạn không có quyền truy cập hồ sơ.");
      } else if (err.response?.status === 400) {
        setError("Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.");
      } else {
        setError("Lỗi server. Vui lòng thử lại sau.");
      }
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (updatedProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
  };

  const handleOpenModal = () => {
    if (!userProfile) {
      message.error("Không có thông tin hồ sơ để cập nhật.");
      return;
    }
    console.log("Mở modal, profile:", userProfile);
    setModalVisible(true);
  };

  useEffect(() => {
    getProfileAPI();
  }, []);

  console.log("profile:", userProfile);

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

  if (!userProfile) {
    return (
      <Alert
        message="Không có thông tin hồ sơ để hiển thị."
        type="warning"
        style={{ margin: "20px" }}
      />
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Card
        title="Thông tin hồ sơ"
        variant="borderless"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "20px",
          }}
        >
          <div style={{ flex: 1, textAlign: "center", minWidth: "200px" }}>
            <Avatar
              size={100}
              src={userProfile.avatar || undefined}
              icon={<UserOutlined />}
              style={{ border: "2px solid #1890ff" }}
            />
            <p>Chỉnh sửa hình ảnh</p>
            <h2 style={{ marginTop: "10px" }}>
              {userProfile.name || "Chưa cung cấp"}
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignSelf: "flex-end",
              marginTop: "20px",
            }}
          >
            <Button
              style={{
                backgroundColor: "green",
                color: "white",
                fontWeight: "500",
                height: "36px",
              }}
              shape="round"
              onClick={handleOpenModal}
            >
              Cập nhật tài khoản
            </Button>
            <Button
              type="primary"
              danger
              shape="round"
              style={{
                fontWeight: "500",
                height: "36px",
              }}
            >
              Xóa tài khoản
            </Button>
          </div>
        </div>
        <Descriptions bordered column={1} styles={{ label: { width: "30%" } }}>
          <Descriptions.Item label="Họ và tên">
            {userProfile.name || "Chưa cung cấp"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {userProfile.email || "Chưa cung cấp"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {userProfile.phone || "Chưa cung cấp"}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {userProfile.gender ? "Nam" : "Nữ"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {modalVisible && (
        <UpdateProfile
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          profile={userProfile}
          onSuccess={handleUpdateSuccess}
          showModal={showModal}
        />
      )}
    </div>
  );
};

export default UserProfile;
