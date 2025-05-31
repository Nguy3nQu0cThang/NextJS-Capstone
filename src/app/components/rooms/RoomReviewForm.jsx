"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Rate, Button, message } from "antd";
import { postRoomReview } from "app/services/roomService";

const RoomReviewForm = ({ roomId, user, onReviewPosted }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Set mặc định sao là 5 khi form được mount
    form.setFieldsValue({ saoBinhLuan: 5 });
  }, [form]);

  const handleSubmit = async (values) => {
    if (!user || !localStorage.getItem("token")) {
      message.error("Vui lòng đăng nhập để gửi bình luận!");
      return;
    }

    const reviewData = {
      maPhong: roomId,
      maNguoiBinhLuan: user.id,
      noiDung: values.noiDung,
      saoBinhLuan: values.saoBinhLuan,
      ngayBinhLuan: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      await postRoomReview(reviewData);
      message.success("Gửi bình luận thành công!");
      form.resetFields();
      form.setFieldsValue({ saoBinhLuan: 5 }); // Set lại 5 sao sau khi reset
      onReviewPosted();
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
      message.error("Gửi bình luận thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Viết đánh giá của bạn</h3>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="saoBinhLuan"
          label="Đánh giá"
          rules={[{ required: true, message: "Vui lòng chọn số sao!" }]}
        >
          <Rate />
        </Form.Item>
        <Form.Item
          name="noiDung"
          label="Bình luận"
          rules={[
            { required: true, message: "Vui lòng nhập nội dung bình luận!" },
          ]}
        >
          <Input.TextArea rows={4} placeholder="Nhập bình luận của bạn" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            size="large"
          >
            Gửi bình luận
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RoomReviewForm;
