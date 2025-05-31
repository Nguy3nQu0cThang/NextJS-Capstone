"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Button } from "antd";
import { http } from "app/utils/setting";
import { useAuth } from "app/context/AuthContext";

const Login = ({ onSuccess, initialValues = { email: "", password: "" } }) => {
  const [form] = Form.useForm();
  const { login, showModal } = useAuth(); // 👉 lấy thêm showModal
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  const onFinish = async (values) => {
    try {
      setErrorMessage("");
      const response = await http.post("/api/auth/signin", values);
      const { content } = response.data;

      if (content?.token) {
        const username = content.email || values.email;
        const profile = content.user || null;

        await login(username, content.token, profile);
        form.resetFields();
        localStorage.removeItem("tempPassword");
        onSuccess(username);
      } else {
        throw new Error("Không tìm thấy token trong phản hồi.");
      }
    } catch (error) {
      let errorMsg = "Đăng nhập thất bại!";
      if (error.response?.data) {
        errorMsg =
          error.response.data.content ||
          error.response.data.message ||
          errorMsg;
      }
      setErrorMessage(errorMsg);
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

      {/* ✅ Thêm phần "Đăng ký" */}
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <span>Bạn chưa có tài khoản? </span>
        <span
          onClick={() => showModal("register")}
          style={{
            color: "#1890ff",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Đăng ký
        </span>
      </div>
    </div>
  );
};

export default Login;
