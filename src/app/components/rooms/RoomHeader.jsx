"use client";

import { StarFilled } from "@ant-design/icons";

const RoomHeader = ({ room }) => {
  if (!room) return null;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl md:text-3xl font-bold">{room.tenPhong}</h1>

      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <StarFilled className="text-yellow-400" />
        <span>4.8</span>
        <span>·</span>
        <span>{room.tinhThanh || "Việt Nam"}</span>
      </div>
    </div>
  );
};

export default RoomHeader;
