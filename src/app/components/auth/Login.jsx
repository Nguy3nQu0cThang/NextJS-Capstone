"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Button } from "antd";
import { http } from "app/utils/setting";
import { useAuth } from "app/context/AuthContext";

const Login = ({ onSuccess, initialValues = { email: "", password: "" } }) => {
  const [form] = Form.useForm();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState(""); // State để lưu thông báo lỗi

  useEffect(() => {
    form.setFieldsValue(initialValues); // Điền dữ liệu khi có initialValues
  }, [initialValues, form]);

  const onFinish = async (values) => {
    try {
      setErrorMessage(""); // Xóa thông báo lỗi trước khi gửi request mới
      const response = await http.post("/api/auth/signin", values);
      const { content } = response.data;

      if (content?.token) {
        const username = content.email || values.email;
        const profile = content.user || null;

        await login(username, content.token, profile);
        form.resetFields();
        localStorage.removeItem("tempPassword"); // Xóa password sau khi đăng nhập thành công
        onSuccess(username);
      } else {
        throw new Error("Không tìm thấy token trong phản hồi.");
      }
    } catch (error) {
      let errorMsg = "Đăng nhập thất bại!";
      if (error.response?.data) {
        // Ưu tiên hiển thị content nếu có, nếu không dùng message
        errorMsg =
          error.response.data.content ||
          error.response.data.message ||
          errorMsg;
      }
      setErrorMessage(errorMsg); // Lưu thông báo lỗi vào state
      
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "15px 0" }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
      >
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

        {errorMessage && (
          <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>
            {errorMessage}
          </p>
        )}
      </Form>
    </div>
  );
};

export default Login;
