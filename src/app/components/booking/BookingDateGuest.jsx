"use client";

import { CalendarOutlined, UserOutlined, EditOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const BookingDateGuest = ({ roomId, checkin, checkout, guests }) => {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/rooms/${roomId}`);
  };

  return (
    <div className="border rounded-xl p-4 space-y-3 shadow-sm">
      <h3 className="text-lg font-semibold">Thông tin đặt</h3>

      <div className="flex items-center gap-3 text-sm text-gray-700">
        <CalendarOutlined className="text-xl text-gray-500" />
        <span>
          {checkin} → {checkout}
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-700">
        <UserOutlined className="text-xl text-gray-500" />
        <span>{guests} khách</span>
      </div>

      <button
        onClick={handleEdit}
        className="flex items-center gap-2 text-blue-600 hover:underline text-sm mt-2"
      >
        <EditOutlined />
        Chỉnh sửa thông tin
      </button>
    </div>
  );
};

export default BookingDateGuest;
