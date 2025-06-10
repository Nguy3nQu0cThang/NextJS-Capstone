"use client";

import { Button, message } from "antd";
import { bookRoom } from "app/services/bookingService";

const BookingConfirmButton = ({
  roomId,
  checkin,
  checkout,
  guestCount,
  userId,
}) => {
  const handleConfirm = async () => {
    console.log("Xác nhận đang chạy");
    try {
      const payload = {
        maPhong: roomId,
        ngayDen: new Date(checkin).toISOString(),
        ngayDi: new Date(checkout).toISOString(),
        soLuongKhach: guestCount,
        maNguoiDung: userId,
      };
      const res = await bookRoom(payload);
      console.log("Đặt phòng API hoàn tất:", res);

      if (res?.statusCode === 201) {
        alert("Đặt phòng thành công!");
      } else {
        alert("Đặt phòng thất bại: " + res?.message);
      }
    } catch (error) {
      console.error("Lỗi đặt phòng:", error);
      alert("Đặt phòng thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <div>
      <Button
        type="primary"
        block
        size="large"
        className="bg-[#ff385c] hover:bg-[#ff5a74] border-none rounded-xl mt-4 "
        onClick={handleConfirm}
      >
        Xác nhận và thanh toán
      </Button>
    </div>
  );
};

export default BookingConfirmButton;
