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
import { useAuth } from "../../../context/AuthContext";
import { http } from "app/utils/setting";
import UpdateProfile from "app/components/User/UpdateProfile";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const router = useRouter();
  const { userProfile, setUserProfile, checkAuthState, showModal } = useAuth();

  useEffect(() => {
    const getProfileAPI = async () => {
      try {
        setLoading(true);
        const isAuthenticated = await checkAuthState();
        if (!isAuthenticated) return router.push("/");

        if (userProfile) return setLoading(false);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const res = await http.post(
          "https://apistore.cybersoft.edu.vn/api/Users/getProfile",
          {},
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        const { statusCode, content } = res.data;
        if (statusCode === 200 && content) {
          setUserProfile(content);
          localStorage.setItem("userProfile", JSON.stringify(content));
        } else {
          setError("Không có thông tin hồ sơ để hiển thị.");
        }
      } catch (err) {
        if (err.name === "AbortError")
          setError("Yêu cầu quá lâu, vui lòng thử lại.");
        else router.push("/");
      } finally {
        setLoading(false);
      }
    };

    getProfileAPI();
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleUpdateSuccess = (updated) => {
    setUserProfile(updated);
    localStorage.setItem("userProfile", JSON.stringify(updated));
    window.location.reload();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadModalVisible(true);
    }
  };

  const handleUploadAvatar = async () => {
    try {
      setUploadModalVisible(false); // Đóng modal ngay lập tức
      if (!selectedFile) {
        message.error({
          content: "Vui lòng chọn một ảnh.",
          style: { fontSize: "12px" },
        });
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error({
          content: "Vui lòng đăng nhập để tải ảnh.",
          style: { fontSize: "12px" },
        });
        setTimeout(() => {
          router.push("/");
          showModal("login");
        }, 2000);
        return;
      }

      const isAuthenticated = await checkAuthState();
      if (!isAuthenticated) {
        message.error({
          content: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
          style: { fontSize: "12px" },
        });
        setTimeout(() => {
          router.push("/");
          showModal("login");
        }, 2000);
        return;
      }

      const formData = new FormData();
      formData.append("formFile", selectedFile);
      const res = await http.post("/api/Users/uploadavatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (
        res.status === 200 &&
        res.data.statusCode === 200 &&
        res.data.content
      ) {
        const newAvatarUrl = res.data.content.avatar;
        const updatedProfile = { ...userProfile, avatar: newAvatarUrl };
        setUserProfile(updatedProfile);
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
        message.success({
          content: "Cập nhật avatar thành công!",
          style: { fontSize: "12px" },
        });
      } else {
        message.error({
          content: res.data?.message || "Cập nhật avatar thất bại!",
          style: { fontSize: "12px" },
        });
      }
    } catch (err) {
      message.error({
        content: err.response?.data?.message || "Đã xảy ra lỗi khi tải ảnh.",
        style: { fontSize: "12px" },
      });
      if (err.response?.status === 401) {
        localStorage.clear();
        setTimeout(() => {
          router.push("/");
          showModal("login");
        }, 2000);
      }
    } finally {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác."
      )
    )
      return;

    try {
      const res = await http.delete(`/api/Users?email=${userProfile?.email}`);
      if (
        res.status === 200 ||
        res.data?.statusCode === 200 ||
        res.data?.success
      ) {
        message.success("Tài khoản đã được xóa thành công!");
        localStorage.clear();
        router.push("/");
        showModal("login");
      } else {
        message.error(res.data?.message || "Xóa tài khoản thất bại!");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Xóa tài khoản thất bại!");
    }
  };

  const handleOpenUpdateModal = () => {
    if (!userProfile)
      return message.error("Không có thông tin hồ sơ để cập nhật.");
    setModalVisible(true);
  };

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
              src={previewUrl || userProfile.avatar || undefined}
              icon={<UserOutlined />}
              style={{ border: "2px solid #1890ff" }}
            />
            <p style={{ marginTop: "20px" }}>
              <label
                htmlFor="avatar-upload"
                style={{
                  cursor: "pointer",
                  color: "#1890ff",
                  textDecoration: "underline",
                }}
              >
                Chỉnh sửa hình ảnh
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </p>
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
              onClick={handleOpenUpdateModal}
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
              onClick={handleDeleteAccount}
            >
              Xóa tài khoản
            </Button>
          </div>
        </div>

        <Descriptions bordered column={1}>
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

      <Modal
        title="Xác nhận tải ảnh"
        open={uploadModalVisible}
        onOk={handleUploadAvatar}
        onCancel={() => {
          setUploadModalVisible(false);
          setSelectedFile(null);
          setPreviewUrl(null);
        }}
        okText="Tải lên"
        okType="primary"
        cancelText="Hủy"
        maskClosable={false}
        style={{ zIndex: 9999 }}
      >
        <div>
          <p>Bạn có muốn tải ảnh này lên làm avatar?</p>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ maxWidth: "100%", marginTop: "10px" }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
