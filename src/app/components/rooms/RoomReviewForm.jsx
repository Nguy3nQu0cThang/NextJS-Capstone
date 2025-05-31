"use client";

import { useState, useEffect } from "react";
import { Input, Button, Rate, message } from "antd";
import { useAuth } from "app/context/AuthContext";
import { postRoomReview } from "app/services/roomService";

const RoomReviewForm = ({ roomId, user, onSuccess }) => {
  const { isLoggedIn, showModal, userProfile } = useAuth();
  const [noiDung, setNoiDung] = useState("");
  const [saoBinhLuan, setSaoBinhLuan] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log("Rendering RoomReviewForm for roomId:", roomId); // Debug render
  }, [roomId]);

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      message.warning("Bạn cần đăng nhập để gửi bình luận.");
      showModal("login");
      return;
    }

    if (!userProfile || !userProfile.id) {
      console.log("userProfile:", userProfile);
      message.error(
        "Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại."
      );
      showModal("login");
      return;
    }

    if (!noiDung.trim()) {
      message.error("Nội dung không được để trống.");
      return;
    }

    const payload = {
      maPhong: roomId,
      maNguoiBinhLuan: userProfile.id,
      ngayBinhLuan: new Date().toISOString(),
      noiDung,
      saoBinhLuan,
    };

    try {
      setSubmitting(true);
      console.log("Submitting review with payload:", payload);
      console.log("User token:", localStorage.getItem("token"));
      await postRoomReview(payload);
      message.success("Đã gửi bình luận!");
      setNoiDung("");
      setSaoBinhLuan(5);
      onSuccess?.();
    } catch (err) {
      console.error("Lỗi gửi bình luận:", err);
      message.error(
        `Không thể gửi bình luận: ${
          err.response?.data?.content || "Vui lòng thử lại."
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 px-4 md:px-2">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg md:text-xl font-semibold text-primary mb-3">
          Viết bình luận
        </h3>
        <Rate value={saoBinhLuan} onChange={setSaoBinhLuan} />
        <Input.TextArea
          rows={4}
          value={noiDung}
          onChange={(e) => setNoiDung(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          className="mt-5 text-sm md:text-base"
        />
        <div className="text-left mt-3">
          <Button
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            className="bg-primary border-primary hover:bg-primaryHover hover:border-primaryHover rounded-lg w-full md:w-auto px-6 py-2"
          >
            Gửi bình luận
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomReviewForm;
