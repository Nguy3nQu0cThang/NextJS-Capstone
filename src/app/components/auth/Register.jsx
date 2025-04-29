"use client";

import React from "react";
import { Form, Input, Button, Select, message } from "antd";
import { http } from "app/utils/setting";

const { Option } = Select;

const Register = ({ onSuccess }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const { confirmPassword, ...userData } = values;
      console.log("Bắt đầu đăng ký với dữ liệu:", userData);

      const res = await http.post("/api/Users/signup", userData);
      console.log("Đăng ký thành công, response:", res.data);

      message.success("Đăng ký thành công!");
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
