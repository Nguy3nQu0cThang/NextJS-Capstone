"use client";

import { Button, message } from "antd";

const BookingConfirmButton = () => {
  const handleConfirm = () => {
    
    message.success("Đặt phòng thành công! (mô phỏng)", 3);
  };

  return (
    <div>
      <Button
        type="primary"
        block
        size="large"
        className="bg-[#ff385c] hover:bg-[#ff5a74] border-none rounded-xl mt-4"
        onClick={handleConfirm}
      >
        Xác nhận và thanh toán
      </Button>
    </div>
  );
};

export default BookingConfirmButton;
