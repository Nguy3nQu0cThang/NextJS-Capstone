"use client";

import React from "react";
import { Form, Input, Button, message } from "antd";
import { http } from "app/utils/setting";
import { useAuth } from "app/context/AuthContext";

const Login = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { login } = useAuth();
  console.log("Form instance created in Login:", form);

  const onFinish = async (values) => {
    try {
      console.log("Bắt đầu đăng nhập với dữ liệu:", values);
      const res = await http.post("/api/Users/signin", values);
      console.log("Đăng nhập thành công, response:", res.data);

      const token = res.data.content.accessToken;
      const username = res.data.content.email || values.email;

      await login(username, token);
      message.success("Đăng nhập thành công!");
      console.log("Đã gọi message.success cho đăng nhập");
      form.resetFields();
      onSuccess(username);
    } catch (error) {
      console.error(
        "Đăng nhập thất bại:",
        error.response?.data || error.message
      );
      message.error(error.response?.data?.message || "Đăng nhập thất bại!");
      console.log("Đã gọi message.error cho đăng nhập thất bại");
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
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            style={{ marginTop: "10px" }}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;