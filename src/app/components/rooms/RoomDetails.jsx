"use client";

import {
  UserOutlined,
  HomeOutlined,
  RestOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const RoomDetails = ({ room }) => {
  if (!room) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Giới thiệu</h2>
        <p className="text-gray-700">
          {room.moTa || "Không có mô tả chi tiết."}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>{room.khach} khách</span>
        </div>
        <div className="flex items-center gap-2">
          <HomeOutlined />
          <span>{room.phongNgu} phòng ngủ</span>
        </div>
        <div className="flex items-center gap-2">
          <AppstoreOutlined />
          <span>{room.giuong} giường</span>
        </div>
        <div className="flex items-center gap-2">
          <RestOutlined />
          <span>{room.phongTam} phòng tắm</span>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
