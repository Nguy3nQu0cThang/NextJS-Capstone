"use client";

import React from "react";
import { Form, Input, Button, message } from "antd";
import { http } from "app/utils/setting";
import { useAuth } from "app/context/AuthContext";

const Login = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
      const response = await http.post("/api/auth/signin", values);
      const { content } = response.data;

      if (content?.token) {
        const username = content.email || values.email;
        const profile = content.user || null; // <-- thêm dòng này nếu có trả về user profile

        await login(username, content.token, profile); // <-- truyền thêm profile vào
        message.success("Đăng nhập thành công!");
        form.resetFields();
        onSuccess(username);
      } else {
        throw new Error("Không tìm thấy token trong phản hồi.");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Đăng nhập thất bại!";
      message.error(errorMsg);
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
