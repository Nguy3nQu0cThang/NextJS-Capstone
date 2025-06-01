"use client";

import {
  CalendarOutlined,
  UserOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const BookingDateGuest = ({ roomId, checkin, checkout, guests }) => {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/rooms/${roomId}`);
  };

  return (
    <div className="w-full px-4 md:px-0">
      <div className="border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm bg-white space-y-4">
        {/* Tiêu đề */}
        <h3 className="text-base md:text-lg font-semibold text-gray-800">
          Thông tin đặt
        </h3>

        {/* Ngày đặt */}
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <CalendarOutlined className="text-lg text-gray-500" />
          <span className="break-all">
            {checkin} &rarr; {checkout}
          </span>
        </div>

        {/* Số khách */}
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <UserOutlined className="text-lg text-gray-500" />
          <span className="break-words">{guests} khách</span>
        </div>

        {/* Nút chỉnh sửa */}
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium transition"
        >
          <EditOutlined />
          Chỉnh sửa thông tin
        </button>
      </div>
    </div>
  );
};

export default BookingDateGuest;
