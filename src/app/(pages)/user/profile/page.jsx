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
import { getBookingsByUser } from "app/services/bookingService";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [roomDetails, setRoomDetails] = useState({});
  const [locationDetails, setLocationDetails] = useState({});
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

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!userProfile?.id) return;

      setLoadingRooms(true);
      try {
        const res = await getBookingsByUser(userProfile.id);
        const bookings = res.data.content;
        setUserBookings(bookings);

        const roomPromises = bookings.map(async (booking) => {
          try {
            const roomRes = await http.get(
              `https://airbnbnew.cybersoft.edu.vn/api/phong-thue/${booking.maPhong}`
            );
            return { maPhong: booking.maPhong, ...roomRes.data.content };
          } catch (err) {
            console.error(
              `Lỗi khi lấy chi tiết phòng ${booking.maPhong}:`,
              err
            );
            return {
              maPhong: booking.maPhong,
              error: "Không lấy được thông tin phòng",
            };
          }
        });

        const rooms = await Promise.all(roomPromises);
        const roomDetailsMap = rooms.reduce((acc, room) => {
          acc[room.maPhong] = room;
          return acc;
        }, {});
        setRoomDetails(roomDetailsMap);

        const locationPromises = rooms
          .filter((room) => room.maViTri && !room.error)
          .map(async (room) => {
            try {
              const locationRes = await http.get(
                `https://airbnbnew.cybersoft.edu.vn/api/vi-tri/${room.maViTri}`
              );
              return { maViTri: room.maViTri, ...locationRes.data.content };
            } catch (err) {
              console.error(`Lỗi khi lấy vị trí ${room.maViTri}:`, err);
              return {
                maViTri: room.maViTri,
                error: "Không lấy được thông tin vị trí",
              };
            }
          });

        const locations = await Promise.all(locationPromises);
        const locationDetailsMap = locations.reduce((acc, location) => {
          acc[location.maViTri] = location;
          return acc;
        }, {});
        setLocationDetails(locationDetailsMap);
      } catch (err) {
        console.error("Lỗi khi lấy lịch sử đặt phòng:", err);
        message.error("Không thể tải lịch sử đặt phòng.");
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchUserBookings();
  }, [userProfile?.id]);

  const handleDeleteAccount = () => {
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
      <div className="text-center my-12">
        <Spin size="large" />
        <p className="mt-2">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" className="m-5" />;
  }

  if (!userProfile) {
    return (
      <Alert
        message="Không có thông tin hồ sơ để hiển thị."
        type="warning"
        className="m-5"
      />
    );
  }

  const { avatar, name, email, phone, birthday, gender } = userProfile;

  return (
    <div className="flex gap-6 max-w-6xl mx-auto p-5">
      {/* Thông tin người dùng - 40% */}
      <div className="w-[40%]">
        <Card title="Thông tin hồ sơ" variant={false} className="shadow-lg">
          <div className="flex justify-between items-start mb-4">
            {/* Avatar, Upload, Tên */}
            <div className="flex flex-col items-center">
              <Avatar
                size={80}
                src={avatar || null}
                icon={<UserOutlined />}
                className="border-2 border-blue-500"
              />
              <div className="my-2">
                <AvatarUpload
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  refreshProfile={refreshProfile}
                />
              </div>
              <h2 className="text-lg font-semibold">
                {name || "Chưa cung cấp"}
              </h2>
            </div>
            {/* Nút Cập nhật và Xóa */}
            <div className="flex flex-col gap-2">
              <Button
                className="bg-green-600 text-white font-medium h-9 rounded-full"
                onClick={handleOpenUpdateModal}
              >
                Cập nhật tài khoản
              </Button>
              <Button
                type="primary"
                danger
                className="font-medium h-9 rounded-full"
                loading={deleting}
                onClick={handleDeleteAccount}
              >
                Xóa tài khoản
              </Button>
            </div>
          </div>

          <Descriptions variant column={1}>
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
      </div>

      {/* Lịch sử đặt phòng - 60% */}
      {userBookings.length > 0 && (
        <div className="w-[60%] max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-white scrollbar-thumb-rounded">
          <Card
            title="Lịch sử đặt phòng"
            variant={false}
            className="shadow-lg"
          >
            {loadingRooms ? (
              <div className="text-center my-4">
                <Spin size="large" />
                <p className="mt-2">Đang tải lịch sử đặt phòng...</p>
              </div>
            ) : (
              userBookings.map((booking) => {
                const room = roomDetails[booking.maPhong] || {};
                const location = room.maViTri
                  ? locationDetails[room.maViTri]
                  : {};
                return (
                  <div key={booking.id} className="mb-3">
                    <p>
                      <strong>Tên phòng:</strong>{" "}
                      {room.tenPhong || "Đang tải..."}
                    </p>
                    <p>
                      <strong>Vị trí:</strong>{" "}
                      {location.tenViTri
                        ? `${location.tenViTri}, ${location.tinhThanh}, ${location.quocGia}`
                        : "Không có thông tin vị trí"}
                    </p>
                    <p>
                      <strong>Ngày đến:</strong>{" "}
                      {new Date(booking.ngayDen).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Ngày đi:</strong>{" "}
                      {new Date(booking.ngayDi).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Số lượng khách:</strong> {booking.soLuongKhach}
                    </p>
                    {(room.error || location.error) && (
                      <p className="text-red-500">
                        {room.error || location.error}
                      </p>
                    )}
                    <hr className="my-2" />
                  </div>
                );
              })
            )}
          </Card>
        </div>
      )}

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
          try {
            setDeleting(true);
            await deleteAccount(userProfile.id);
            clearAuthData();
            await checkAuthState();
            setUserProfile(null);
            message.success("Tài khoản đã được xóa thành công.");
            router.push("/");
          } catch (error) {
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
