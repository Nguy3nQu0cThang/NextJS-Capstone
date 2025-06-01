"use client";

import dayjs from "dayjs";

const BookingPriceBreakdown = ({ room, checkin, checkout, guests }) => {
  if (!room || !checkin || !checkout) return null;

  const nights = dayjs(checkout).diff(dayjs(checkin), "day") || 1;
  const pricePerNight = room.giaTien;
  const roomTotal = nights * pricePerNight;
  const serviceFee = Math.round(roomTotal * 0.1);
  const total = roomTotal + serviceFee;

  return (
    <div className="border border-gray-200 rounded-xl p-4 shadow-sm space-y-4 text-sm">
      <h3 className="text-lg font-semibold">Chi tiết giá</h3>

      <div className="flex justify-between">
        <span>
          {pricePerNight.toLocaleString()}₫ x {nights} đêm
        </span>
        <span>{roomTotal.toLocaleString()}₫</span>
      </div>

      <div className="flex justify-between">
        <span>Phí dịch vụ</span>
        <span>{serviceFee.toLocaleString()}₫</span>
      </div>

      <hr />

      <div className="flex justify-between font-semibold text-base">
        <span>Tổng cộng</span>
        <span>{total.toLocaleString()}₫</span>
      </div>
    </div>
  );
};

export default BookingPriceBreakdown;
