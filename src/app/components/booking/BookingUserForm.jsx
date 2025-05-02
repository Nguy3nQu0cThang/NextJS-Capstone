"use client";

import { useState } from "react";
import { Input, Form, message } from "antd";

const BookingUserForm = () => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    console.log("Thông tin người đặt:", values);
    message.success("Thông tin đã được lưu (demo)");
  };

  return (
    <div className="border rounded-xl p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Thông tin người đặt</h3>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          fullName: "",
          email: "",
          phone: "",
        }}
      >
        <Form.Item
          label="Họ tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
        >
          <Input placeholder="Nguyễn Văn A" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="example@gmail.com" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input placeholder="0123456789" />
        </Form.Item>
      </Form>
    </div>
  );
};

export default BookingUserForm;
