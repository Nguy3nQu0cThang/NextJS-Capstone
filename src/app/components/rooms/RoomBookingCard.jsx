"use client";

import { useState } from "react";
import { Card, Button, DatePicker, InputNumber, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";
import { useRouter } from "next/navigation";
import { useAuth } from "app/context/AuthContext";

const { RangePicker } = DatePicker;

const RoomBookingCard = ({ room }) => {
  const [dates, setDates] = useState([]);
  const [guests, setGuests] = useState(1);
  const router = useRouter();

  const { isLoggedIn, showModal } = useAuth(); // Lấy trạng thái đăng nhập

  const handleBooking = () => {
    if (!isLoggedIn) {
      message.warning("Bạn cần đăng nhập trước khi đặt phòng!");
      // Nếu bạn có modal đăng nhập, gọi showModal("login") hoặc chuyển trang login
      showModal("login");
      return;
    }

    if (dates.length !== 2) {
      message.error("Vui lòng chọn ngày nhận và trả phòng.");
      return;
    }

    const checkIn = dayjs(dates[0]).format("YYYY-MM-DD");
    const checkOut = dayjs(dates[1]).format("YYYY-MM-DD");

    console.log("Đặt phòng:", {
      roomId: room.id,
      checkIn,
      checkOut,
      guests,
    });

    message.success("Đặt phòng thành công (mô phỏng)!");

    router.push(
      `/booking/${room.id}?checkin=${checkIn}&checkout=${checkOut}&numberOfGuests=${guests}`
    );
  };

  return (
    <Card
      variant="outlined"
      className="shadow-lg rounded-2xl sticky top-24"
      styles={{ body: { padding: 0 } }}
    >
      <div className="space-y-4 p-6">
        <div className="text-2xl font-semibold">
          {room.giaTien.toLocaleString()}₫{" "}
          <span className="text-base font-normal">/ đêm</span>
        </div>

        <RangePicker
          locale={locale}
          format="DD/MM/YYYY"
          className="w-full rounded-lg"
          onChange={(val) => setDates(val)}
        />

        <InputNumber
          min={1}
          max={10}
          value={guests}
          onChange={(val) => setGuests(val)}
          className="w-full rounded-lg"
          placeholder="Số lượng khách"
        />

        <Button
          type="primary"
          block
          className="bg-[#ff385c] hover:bg-[#ff5a74] border-none rounded-lg"
          size="large"
          onClick={handleBooking}
        >
          Đặt phòng
        </Button>
      </div>
    </Card>
  );
};

export default RoomBookingCard;
