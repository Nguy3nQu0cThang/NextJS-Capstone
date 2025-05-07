"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Avatar, Descriptions, Alert, Spin, Button, message } from "antd"; // Bỏ Modal
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { http } from "app/utils/setting";
import UpdateProfile from "app/components/User/UpdateProfile";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notification, setNotification] = useState(null);
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
      const timeoutId = setTimeout(() => controller.abort(), 15000);
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
      console.error(
        "API Error:",
        err.response?.status || err.code,
        err.response?.data || err.message
      );
      if (err.name === "AbortError") {
        setError("Yêu cầu quá lâu, vui lòng thử lại.");
        setLoading(false);
      } else {
        router.push("/");
      }
    }
  };

  const handleUpdateSuccess = (updatedProfile) => {
    console.log(
      "handleUpdateSuccess called with updatedProfile:",
      updatedProfile
    );
    setUserProfile(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    console.log(
      "Đã lưu userProfile vào localStorage:",
      localStorage.getItem("userProfile")
    );
    console.log("Reload toàn bộ trang để hiển thị thông tin mới...");
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    console.log("handleDeleteAccount được gọi"); // Debug: Xác nhận hàm chạy

    // Dùng window.confirm thay cho Modal.confirm
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác."
    );
    console.log("Người dùng xác nhận:", confirmed); // Debug: Xác nhận người dùng bấm OK/Cancel

    if (!confirmed) {
      console.log("Người dùng hủy xóa tài khoản");
      return;
    }

    // Logic xóa tài khoản
    (async () => {
      try {
        console.log("userProfile:", userProfile); // Debug
        if (!userProfile || !userProfile.email) {
          console.log("Thiếu userProfile hoặc email");
          setNotification({
            type: "error",
            message: "Không tìm thấy thông tin tài khoản để xóa.",
          });
          message.error({
            content: "Không tìm thấy thông tin tài khoản để xóa.",
            style: { color: "#ff4d4f", fontSize: "12px" },
          });
          return;
        }

        const token = localStorage.getItem("accessToken");
        console.log("accessToken:", token); // Debug
        if (!token) {
          console.log("Thiếu accessToken");
          setNotification({
            type: "error",
            message: "Vui lòng đăng nhập để xóa tài khoản.",
          });
          message.error({
            content: "Vui lòng đăng nhập để xóa tài khoản.",
            style: { color: "#ff4d4f", fontSize: "12px" },
          });
          setTimeout(() => {
            setNotification(null);
            router.push("/");
            showModal("login");
          }, 3000);
          return;
        }

        const isAuthenticated = await checkAuthState();
        console.log("isAuthenticated:", isAuthenticated); // Debug
        if (!isAuthenticated) {
          console.log("Không xác thực được");
          setNotification({
            type: "error",
            message: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
          });
          message.error({
            content: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
            style: { color: "#ff4d4f", fontSize: "12px" },
          });
          setTimeout(() => {
            setNotification(null);
            router.push("/");
            showModal("login");
          }, 3000);
          return;
        }

        console.log("Gọi API xóa tài khoản với email:", userProfile.email);
        const res = await http.delete(`/api/Users?email=${userProfile.email}`);
        console.log("Xóa tài khoản response:", res); // Debug: Log toàn bộ response

        if (
          res.status === 200 ||
          (res.data && (res.data.statusCode === 200 || res.data.success))
        ) {
          console.log("Xóa tài khoản thành công");
          setNotification({
            type: "success",
            message: "Tài khoản của bạn đã được xóa thành công!",
          });
          message.success({
            content: "Tài khoản của bạn đã được xóa thành công!",
            style: { color: "#52c41a", fontSize: "12px" },
          });
          localStorage.clear();
          setTimeout(() => {
            setNotification(null);
            router.push("/");
            showModal("login");
          }, 3000);
        } else {
          console.log("Xóa tài khoản thất bại, response không mong muốn");
          setNotification({
            type: "error",
            message: res.data?.message || "Xóa tài khoản thất bại!",
          });
          message.error({
            content: res.data?.message || "Xóa tài khoản thất bại!",
            style: { color: "#ff4d4f", fontSize: "12px" },
          });
        }
      } catch (error) {
        console.error(
          "Xóa tài khoản lỗi:",
          error.response?.data || error.message
        ); // Debug
        if (error.response?.status === 405) {
          console.log("Thử POST vì DELETE không được hỗ trợ...");
          try {
            const resPost = await http.post(
              `/api/Users?email=${userProfile.email}`,
              {}
            );
            console.log("Xóa tài khoản response (POST):", resPost);
            if (
              resPost.status === 200 ||
              (resPost.data &&
                (resPost.data.statusCode === 200 || resPost.data.success))
            ) {
              console.log("Xóa tài khoản thành công (POST)");
              setNotification({
                type: "success",
                message: "Tài khoản của bạn đã được xóa thành công!",
              });
              message.success({
                content: "Tài khoản của bạn đã được xóa thành công!",
                style: { color: "#52c41a", fontSize: "12px" },
              });
              localStorage.clear();
              setTimeout(() => {
                setNotification(null);
                router.push("/");
                showModal("login");
              }, 3000);
            } else {
              console.log("POST thất bại, response không mong muốn");
              setNotification({
                type: "error",
                message: resPost.data?.message || "Xóa tài khoản thất bại!",
              });
              message.error({
                content: resPost.data?.message || "Xóa tài khoản thất bại!",
                style: { color: "#ff4d4f", fontSize: "12px" },
              });
            }
          } catch (postError) {
            console.error(
              "POST lỗi:",
              postError.response?.data || postError.message
            );
            setNotification({
              type: "error",
              message:
                postError.response?.data?.message || "Xóa tài khoản thất bại!",
            });
            message.error({
              content:
                postError.response?.data?.message || "Xóa tài khoản thất bại!",
              style: { color: "#ff4d4f", fontSize: "12px" },
            });
          }
        } else if (error.response?.status === 401) {
          console.log("Lỗi 401: Phiên đăng nhập hết hạn");
          setNotification({
            type: "error",
            message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
          });
          message.error({
            content: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
            style: { color: "#ff4d4f", fontSize: "12px" },
          });
          localStorage.clear();
          setTimeout(() => {
            setNotification(null);
            router.push("/");
            showModal("login");
          }, 3000);
        } else {
          console.log("Lỗi khác:", error.response?.status);
          setNotification({
            type: "error",
            message: error.response?.data?.message || "Xóa tài khoản thất bại!",
          });
          message.error({
            content: error.response?.data?.message || "Xóa tài khoản thất bại!",
            style: { color: "#ff4d4f", fontSize: "12px" },
          });
        }
      }
    })();
  };

  const handleOpenUpdateModal = () => {
    if (!userProfile) {
      message.error("Không có thông tin hồ sơ để cập nhật.");
      return;
    }
    console.log("Mở modal cập nhật, profile:", userProfile);
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
            <p style={{ marginTop: "20px" }}>Chỉnh sửa hình ảnh</p>
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
