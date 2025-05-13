"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Avatar, Descriptions, Alert, Spin, Button, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "app/context/AuthContext";
import { http } from "app/utils/setting";
import UpdateProfile from "app/components/User/UpdateProfile";
import AvatarUpload from "app/components/User/AvatarUpload";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const {
    userProfile,
    userName,
    setUserProfile,
    checkAuthState,
    showModal,
    isCheckingAuth,
  } = useAuth();

  useEffect(() => {
    const getProfileAPI = async () => {
      setLoading(true);

      const isAuthenticated = await checkAuthState();
      if (!isAuthenticated) return router.push("/");

      // Tránh gọi API nếu đã có userProfile khớp với userName
      if (userProfile?.email?.toLowerCase() === userName?.toLowerCase()) {
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await http.get("/api/users", { signal: controller.signal });
        const { statusCode, content } = res.data;

        if (statusCode === 200 && Array.isArray(content)) {
          const found = content.find(
            (u) => u.email.toLowerCase() === userName.toLowerCase()
          );

          if (found) {
            const current = JSON.stringify(userProfile);
            const updated = JSON.stringify(found);
            if (current !== updated) {
              setUserProfile(found);
              localStorage.setItem("userProfile", updated);
            }
          } else {
            setError(`Không tìm thấy hồ sơ cho email: ${userName}`);
          }
        } else {
          setError("Không có thông tin hồ sơ để hiển thị.");
        }
      } catch (err) {
        console.error("Get profile error:", err.response?.data || err.message);
        setError(
          err.name === "AbortError"
            ? "Yêu cầu quá lâu, vui lòng thử lại."
            : null
        );
        if (err.name !== "AbortError") router.push("/");
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    if (userName) getProfileAPI();
  }, [userName]);

  const refreshProfile = async () => {
    setLoading(true);
    try {
      const res = await http.get("/api/users");
      const { statusCode, content } = res.data;
      if (statusCode === 200 && Array.isArray(content)) {
        const found = content.find(
          (u) => u.email.toLowerCase() === userName.toLowerCase()
        );
        if (found) {
          setUserProfile(found);
          localStorage.setItem("userProfile", JSON.stringify(found));
        }
      }
    } catch (err) {
      console.error("Refresh profile error:", err.response?.data || err.message);
      message.error("Lỗi khi làm mới hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (updated) => {
    setUserProfile(updated);
    localStorage.setItem("userProfile", JSON.stringify(updated));
    setModalVisible(false);
    message.success("Cập nhật hồ sơ thành công!");
  };

  const handleOpenUpdateModal = () => {
    if (!userProfile)
      return message.error("Không có thông tin hồ sơ để cập nhật.");
    setModalVisible(true);
  };

  // UI khi đang tải hoặc xác thực
  if (isCheckingAuth || loading) {
    return (
      <div style={{ textAlign: "center", margin: "50px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: "10px" }}>Đang tải thông tin...</p>
      </div>
    );
  }

  // UI khi lỗi
  if (error) {
    return <Alert message={error} type="error" style={{ margin: "20px" }} />;
  }

  // UI khi không có profile
  if (!userProfile) {
    return (
      <Alert
        message="Không có thông tin hồ sơ để hiển thị."
        type="warning"
        style={{ margin: "20px" }}
      />
    );
  }

  const { avatar, name, email, phone, birthday, gender } = userProfile;

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
              src={avatar || null}
              icon={<UserOutlined />}
              style={{ border: "2px solid #1890ff" }}
            />
            <div style={{ marginTop: "10px", marginBottom: "10px" }}>
              <AvatarUpload
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                refreshProfile={refreshProfile}
              />
            </div>
            <h2>{name || "Chưa cung cấp"}</h2>
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
              onClick={handleOpenUpdateModal}
            >
              Cập nhật tài khoản
            </Button>
            <Button
              type="primary"
              danger
              shape="round"
              style={{ fontWeight: "500", height: "36px" }}
            >
              Xóa tài khoản
            </Button>
          </div>
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Họ và tên">
            {name || "Chưa cung cấp"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {email || "Chưa cung cấp"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {phone || "Chưa cung cấp"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {birthday || "Chưa cung cấp"}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {gender ? "Nam" : "Nữ"}
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