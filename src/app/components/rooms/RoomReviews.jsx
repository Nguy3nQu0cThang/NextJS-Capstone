"use client";

import { useEffect, useState } from "react";
import { List, Avatar, Rate, Spin, Button } from "antd";
import { getRoomReviews } from "app/services/roomService";

const RoomReviews = ({ roomId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    if (!roomId) return;
    const fetchReviews = async () => {
      try {
        const res = await getRoomReviews(roomId);
        setReviews(res.data.content || []);
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

    if (roomId) {
      fetchReviews();
    }
  }, [roomId]);

  if (loading) return <Spin className="block mx-auto my-6" />;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;
  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-xl font-semibold">
        Đánh giá từ khách hàng ({reviews.length})
      </h2>

      {reviews.length === 0 && <p>Chưa có bình luận nào.</p>}

      <List
        itemLayout="horizontal"
        dataSource={visibleReviews}
        renderItem={(review) => (
          <List.Item>
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
                  <span className="font-medium">{review.tenNguoiBinhLuan}</span>
                  <Rate disabled defaultValue={review.saoBinhLuan} />
                </div>
              }
              description={<p>{review.noiDung}</p>}
            />
          </List.Item>
        )}
      />
      {hasMore && (
        <div className="text-center mt-4">
          <Button
            type="primary"
            block
            className="bg-[#ff385c] hover:bg-[#ff5a74] border-none rounded-lg"
            size="large"
            onClick={handleLoadMore}
          >
            Xem thêm bình luận
          </Button>
        </div>
      )}
    </div>
  );
};

export default RoomReviews;
