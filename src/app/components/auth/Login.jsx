"use client";

import React from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";

const Login = ({ onSuccess }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      console.log("Bắt đầu đăng nhập với dữ liệu:", values);
      const res = await axios.post(
        "https://apistore.cybersoft.edu.vn/api/Users/signin",
        values,
        {
          headers: {
            TokenCybersoft:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCBTw6FuZyAxNSIsIkhldEhhblN0cmluZyI6IjExLzA5LzIwMjUiLCJIZXRIYW5UaW1lIjoiMTc1NzU0ODgwMDAwMCIsIm5iZiI6MTczMzg1MDAwMCwiZXhwIjoxNzU3Njk2NDAwfQ.5vww18nCtO2mffvALHhzwa38Gyr82SqzU0hb0DLMGx0",
          },
        }
      );

      console.log("Đăng nhập thành công, response:", res.data);
      const token = res.data.content.accessToken;
      localStorage.setItem("accessToken", token);
      const user = JSON.parse(atob(token.split(".")[1]));
      const username =
        user[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] || values.email;

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
