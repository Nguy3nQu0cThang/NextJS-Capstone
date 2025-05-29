"use client";

import { useState } from "react";
import { Input, Button, Rate, message } from "antd";
import { useAuth } from "app/context/AuthContext";
import { postRoomReview } from "app/services/roomService";

const RoomReviewForm = ({ roomId, onSuccess }) => {
  const { userProfile, isLoggedIn, showModal } = useAuth(); // Lấy trạng thái đăng nhập và modal

  const [noiDung, setNoiDung] = useState("");
  const [saoBinhLuan, setSaoBinhLuan] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Nếu chưa đăng nhập
    if (!isLoggedIn) {
      message.warning("Bạn cần đăng nhập để gửi bình luận.");
      showModal("login"); // Mở modal đăng nhập
      return;
    }

    if (!noiDung.trim()) {
      return message.error("Nội dung không được để trống.");
    }

    const payload = {
      maPhong: roomId,
      maNguoiBinhLuan: userProfile?.id,
      ngayBinhLuan: new Date().toISOString(),
      noiDung,
      saoBinhLuan,
    };

    try {
      setSubmitting(true);
      await postRoomReview(payload);
      message.success("Đã gửi bình luận!");
      setNoiDung("");
      setSaoBinhLuan(5);
      onSuccess?.(); // reload lại danh sách bình luận
    } catch (err) {
      console.error("Lỗi gửi bình luận:", err);
      message.error("Không thể gửi bình luận.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Viết bình luận</h3>
      <Rate value={saoBinhLuan} onChange={setSaoBinhLuan} />
      <Input.TextArea
        rows={4}
        value={noiDung}
        onChange={(e) => setNoiDung(e.target.value)}
        placeholder="Chia sẻ trải nghiệm của bạn..."
        className="mt-2"
      />
      <Button
        type="primary"
        loading={submitting}
        onClick={handleSubmit}
        className="mt-2"
      >
        Gửi bình luận
      </Button>
    </div>
  );
};

export default RoomReviewForm;
