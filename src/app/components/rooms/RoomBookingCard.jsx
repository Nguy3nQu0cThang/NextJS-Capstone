"use client";

import { useState } from "react";
import { Card, Button, DatePicker, InputNumber, message, Divider } from "antd";
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

  const { isLoggedIn, showModal } = useAuth();

  const handleBooking = () => {
    if (!isLoggedIn) {
      message.warning("Bạn cần đăng nhập trước khi đặt phòng!");
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

    message.success("Đang chuyển tới trang đặt phòng!");

    router.push(
      `/booking/${room.id}?checkin=${checkIn}&checkout=${checkOut}&numberOfGuests=${guests}`
    );
  };

  const numNights =
    dates.length === 2 ? dayjs(dates[1]).diff(dates[0], "day") : 0;
  const serviceFee = Math.round(room.giaTien * 1000 * 0.1);
  const totalPrice = room.giaTien * 1000 * numNights + serviceFee;

  return (
    <Card
      variant="outlined"
      className="shadow-lg rounded-2xl sticky top-24 comment-wrapper mt-10"
      styles={{ body: { padding: 0 } }}
    >
      <div className="space-y-4 p-6">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Giá thuê</p>
          <div className="text-2xl font-semibold">
            {(room.giaTien * 1000).toLocaleString()}₫{" "}
            <span className="text-base font-normal text-gray-500">/ đêm</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-1">
          Chọn ngày nhận và trả phòng:
        </p>
        <RangePicker
          locale={locale}
          format="DD/MM/YYYY"
          className="w-full rounded-lg"
          onChange={(val) => setDates(val)}
        />

        <div className="mt-3">
          <p className="text-sm text-gray-500 mb-1">Số lượng khách:</p>
          <InputNumber
            min={1}
            max={10}
            value={guests}
            onChange={(val) => setGuests(val)}
            className="w-full rounded-lg"
            placeholder="Số lượng khách"
          />
        </div>

        {numNights > 0 && (
          <>
            <Divider />
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>
                  {(room.giaTien * 1000).toLocaleString()}₫ x {numNights} đêm
                </span>
                <span>
                  {(room.giaTien * 1000 * numNights).toLocaleString()}₫
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phí dịch vụ</span>
                <span>{serviceFee.toLocaleString()}₫</span>
              </div>
              <div className="border-t pt-2 font-semibold flex justify-between">
                <span>Tổng cộng</span>
                <span>{totalPrice.toLocaleString()}₫</span>
              </div>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400 italic mt-1">
          Huỷ miễn phí trong vòng 48 giờ đầu tiên.
        </p>
        <Button
          type="primary"
          block
          className="bg-[#ff385c] hover:bg-[#ff5a74] border-none rounded-lg mt-3"
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
