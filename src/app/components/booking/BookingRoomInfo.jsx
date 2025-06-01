"use client";

import { StarFilled } from "@ant-design/icons";

const BookingRoomInfo = ({ room }) => {
  if (!room) return null;

  return (
    <div className="w-full px-4 md:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm bg-white">
        {/* Ảnh phòng */}
        <img
          src={room.hinhAnh}
          alt={room.tenPhong}
          className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-xl flex-shrink-0"
        />

        {/* Thông tin chi tiết */}
        <div className="flex flex-col justify-between w-full space-y-1">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <StarFilled className="text-yellow-400" />
            <span className="font-medium">4.8</span>
            <span className="mx-1">·</span>
            <span className="truncate">{room.tinhThanh || "Việt Nam"}</span>
          </div>

          <h2 className="text-base md:text-lg font-semibold break-words">
            {room.tenPhong}
          </h2>

          <p className="text-sm text-gray-500 break-words">
            {room.moTa || "Không có mô tả"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingRoomInfo;
