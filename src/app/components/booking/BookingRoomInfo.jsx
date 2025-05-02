"use client";

import { StarFilled } from "@ant-design/icons";

const BookingRoomInfo = ({ room }) => {
  if (!room) return null;

  return (
    <div className="flex items-start gap-4 border rounded-xl p-4 shadow-sm">
      <img
        src={room.hinhAnh}
        alt={room.tenPhong}
        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
      />

      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <StarFilled className="text-yellow-500" />
          <span>4.8</span>
          <span className="mx-1">·</span>
          <span>Việt Nam</span>
        </div>

        <h2 className="text-base font-semibold">{room.tenPhong}</h2>
        <p className="text-sm text-gray-500">
          {room.tinhThanh || "Không rõ vị trí"}
        </p>
      </div>
    </div>
  );
};

export default BookingRoomInfo;
