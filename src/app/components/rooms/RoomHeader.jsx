"use client";

import { StarFilled } from "@ant-design/icons";
import { getRoomReviews } from "app/services/roomService";
import { useEffect, useState } from "react";

const RoomHeader = ({ room }) => {
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (!room?.id) return;
        const res = await getRoomReviews(room.id);
        const reviews = res.data.content;

        if (reviews.length > 0) {
          const totalStars = reviews.reduce(
            (sum, review) => sum + review.saoBinhLuan,
            0
          );
          const avg = (totalStars / reviews.length).toFixed(1);
          setAverageRating(avg);
        } else {
          setAverageRating("Chưa có");
        }
      } catch (error) {
        console.error("Lỗi khi lấy bình luận:", error);
        setAverageRating("Chưa có");
      }
    };

    fetchReviews();
  }, [room?.id]);
  if (!room) return null;
  return (
    <div className="space-y-2">
      <h1 className="text-2xl md:text-3xl font-bold">{room.tenPhong}</h1>

      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <StarFilled className="text-yellow-400" />
        <span>{averageRating !== null ? averageRating : "..."}</span>
        <span>·</span>
        <span>{room.tinhThanh || "Việt Nam"}</span>
      </div>
    </div>
  );
};

export default RoomHeader;
