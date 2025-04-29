"use client";

import { useEffect, useState } from "react";
import { List, Avatar, Rate, Spin } from "antd";
import { getRoomReviews } from "app/services/roomService";

const RoomReviews = ({ roomId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getRoomReviews(roomId);
        setReviews(res.data.content || []);
      } catch (error) {
        console.error("Lỗi lấy bình luận:", error);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchReviews();
    }
  }, [roomId]);

  if (loading) return <Spin className="block mx-auto my-6" />;

  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-xl font-semibold">
        Đánh giá từ khách hàng ({reviews.length})
      </h2>

      {reviews.length === 0 && <p>Chưa có bình luận nào.</p>}

      <List
        itemLayout="horizontal"
        dataSource={reviews}
        renderItem={(review) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={review.avatar} />}
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
    </div>
  );
};

export default RoomReviews;
