"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Avatar, Descriptions, Alert, Spin, Button, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { http } from "app/utils/setting";
import UpdateProfile from "app/components/User/UpdateProfile";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
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
      const res = await http.post("/api/Users/getProfile", {});
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

  const handleUpdateSuccess = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const handleOpenModal = () => {
    if (!profile) {
      message.error("Không có thông tin hồ sơ để cập nhật.");
      return;
    }
    console.log("Mở modal, profile:", profile);
    setModalVisible(true);
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
              src={profile.avatar || undefined}
              icon={<UserOutlined />}
              style={{ border: "2px solid #1890ff" }}
            />
            <p>Chỉnh sửa hình ảnh</p>
            <h2 style={{ marginTop: "10px" }}>
              {profile.name || "Chưa cung cấp"}
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

      {modalVisible && (
        <UpdateProfile
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          profile={profile}
          onSuccess={handleUpdateSuccess}
          showModal={showModal}
        />
      )}
    </div>
  );
};

export default UserProfile;
