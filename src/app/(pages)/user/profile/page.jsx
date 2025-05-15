"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Avatar,
  Descriptions,
  Alert,
  Spin,
  Button,
  message,
  Modal,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "app/context/AuthContext";
import { http } from "app/utils/setting";
import UpdateProfile from "app/components/User/UpdateProfile";
import AvatarUpload from "app/components/User/AvatarUpload";
import { deleteAccount } from "app/services/userService";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const router = useRouter();

  const {
    userProfile,
    userName,
    setUserProfile,
    checkAuthState,
    clearAuthData,
    showModal,
    isCheckingAuth,
  } = useAuth();

  useEffect(() => {
    if (!userProfile?.id) {
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile?.id) {
            setUserProfile(parsedProfile);
          }
        } catch (err) {
          console.error("Lỗi khi parse userProfile từ localStorage:", err);
        }
      }
    }
  }, []);

  useEffect(() => {
    const getProfileAPI = async () => {
      setLoading(true);
      if (!userProfile?.id) {
        setError("Không tìm thấy ID người dùng.");
        setLoading(false);
        return;
      }

      const isAuthenticated = await checkAuthState();
      if (!isAuthenticated) {
        setError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        setLoading(false);
        router.push("/");
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await http.get(
          `https://airbnbnew.cybersoft.edu.vn/api/users/${userProfile.id}`,
          { signal: controller.signal }
        );
        const { statusCode, content } = res.data;

        if (statusCode === 200) {
          setUserProfile(content);
          localStorage.setItem("userProfile", JSON.stringify(content));
        } else {
          setError("Không thể lấy thông tin hồ sơ.");
        }
      } catch (err) {
        setError(
          err.name === "AbortError"
            ? "Yêu cầu quá lâu, vui lòng thử lại."
            : "Lỗi khi lấy hồ sơ."
        );
        if (err.name !== "AbortError") router.push("/");
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    if (userProfile?.id && loading) {
      getProfileAPI();
    }
  }, [userProfile?.id, loading]);

  const handleDeleteAccount = () => {
    console.log("Test button");
    setConfirmVisible(true);
  };

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
      console.error(
        "Refresh profile error:",
        err.response?.data || err.message
      );
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

  if (isCheckingAuth || loading) {
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
              loading={deleting}
              onClick={handleDeleteAccount}
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

      <Modal
        title="Xác nhận xóa tài khoản"
        open={confirmVisible}
        onOk={async () => {
          console.log("Test API");
          try {
            setDeleting(true);
            await deleteAccount(userProfile.id);
            console.log("Delete account successful");

            clearAuthData();
            const isAuthenticated = await checkAuthState(); 
            console.log("Auth state after delete:", { isAuthenticated });

            setUserProfile(null); 
            message.success("Tài khoản đã được xóa thành công.");

            console.log("LocalStorage after clear:", localStorage);

            router.push("/");
          } catch (error) {
            console.error("Delete account error:", error);
            message.error(
              error.message || "Đã có lỗi xảy ra khi xóa tài khoản."
            );
          } finally {
            setDeleting(false);
            setConfirmVisible(false);
          }
        }}
        onCancel={() => setConfirmVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        confirmLoading={deleting}
      >
        <p>Bạn có chắc chắn muốn xóa tài khoản này không?</p>
      </Modal>
    </div>
  );
};

export default UserProfile;
