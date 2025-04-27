"use client";

import React from "react";
import { Form, Input, Button, Select, message } from "antd";
import axios from "axios";

const { Option } = Select;

const Register = ({ onSuccess }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const { confirmPassword, ...userData } = values;

      const res = await axios.post(
        "https://apistore.cybersoft.edu.vn/api/Users/signup",
        userData,
        {
          headers: {
            TokenCybersoft:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCBTw6FuZyAxNSIsIkhldEhhblN0cmluZyI6IjExLzA5LzIwMjUiLCJIZXRIYW5UaW1lIjoiMTc1NzU0ODgwMDAwMCIsIm5iZiI6MTczMzg1MDAwMCwiZXhwIjoxNzU3Njk2NDAwfQ.5vww18nCtO2mffvALHhzwa38Gyr82SqzU0hb0DLMGx0",
          },
        }
      );
      message.success("Đăng ký thành công!");
      console.log("Đăng ký thành công:", res.data);
      form.resetFields();
      console.log("Gọi onSuccess với switchToLogin: true");
      onSuccess({ switchToLogin: true });
    } catch (error) {
      console.error("Đăng ký thất bại:", error.response?.data || error.message);
      message.error(error.response?.data?.message || "Đăng ký thất bại!");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "15px 0" }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu!" },
            { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>

        <Form.Item
          label="Nhập lại mật khẩu"
          name="confirmPassword"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng nhập lại mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu nhập lại không khớp!")
                );
              },
            }),
          ]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu" />
        </Form.Item>

        <Form.Item
          label="Tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
        >
          <Input placeholder="Nhập họ tên" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item label="Giới tính" name="gender" initialValue={true}>
          <Select>
            <Option value={true}>Nam</Option>
            <Option value={false}>Nữ</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            style={{ marginTop: "10px" }}
          >
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
