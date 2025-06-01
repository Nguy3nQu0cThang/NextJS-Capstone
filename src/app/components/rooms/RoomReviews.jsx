"use client";

import { useEffect, useState } from "react";
import { List, Avatar, Rate, Spin, Button } from "antd";
import { getRoomReviews } from "app/services/roomService";
import RoomReviewForm from "./RoomReviewForm";

const RoomReviews = ({ roomId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      console.log("Fetching reviews for roomId:", roomId);
      const res = await getRoomReviews(roomId);
      const sortedReviews = (res.data.content || []).sort(
        (a, b) => new Date(b.ngayBinhLuan) - new Date(a.ngayBinhLuan)
      );
      setReviews(sortedReviews);
    } catch (error) {
      if (error.response?.status === 404) {
        setReviews([]);
      } else {
        console.error("Lỗi lấy bình luận:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    fetchReviews();
  }, [roomId]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-10 px-4 md:px-2">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-6">
          Đánh giá từ khách hàng ({reviews.length})
        </h2>
        <RoomReviewForm roomId={roomId} user={user} onSuccess={fetchReviews} />
        {loading ? (
          <Spin className="block my-6 mx-auto" />
        ) : reviews.length === 0 ? (
          <p className="text-gray-600">Chưa có bình luận nào.</p>
        ) : (
          <List
            className="mb-6"
            itemLayout="horizontal"
            dataSource={visibleReviews}
            renderItem={(review) => (
              <List.Item className="py-2 md:py-3">
                <List.Item.Meta
                  avatar={
                    review.avatar ? (
                      <Avatar src={review.avatar} />
                    ) : (
                      <Avatar>{review.tenNguoiBinhLuan?.charAt(0)}</Avatar>
                    )
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {review.tenNguoiBinhLuan}
                      </span>
                      <Rate disabled value={review.saoBinhLuan} />
                    </div>
                  }
                  description={
                    <div>
                      <p className="text-sm md:text-base">{review.noiDung}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(review.ngayBinhLuan)}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}

        {hasMore && (
          <div className="text-center">
            <Button
              type="primary"
              size="large"
              className="bg-primary border-primary hover:bg-primaryHover hover:border-primaryHover rounded-lg w-full md:w-auto"
              onClick={handleLoadMore}
            >
              Xem thêm bình luận
            </Button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default RoomReviews;
