"use client";

import React from "react";
import { Form, Input, Button, Select, message, DatePicker } from "antd";
import { http } from "app/utils/setting";
import { useAuth } from "app/context/AuthContext";


const { Option } = Select;


const Register = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { login } = useAuth(); 

  const onFinish = async (values) => {
    try {
      const { confirmPassword, ...rest } = values;
      const userData = {
        ...rest,
        birthday: rest.birthday?.format("YYYY-MM-DD"),
      };

      const res = await http.post("/api/auth/signup", userData);

      if (res.data.statusCode === 201) {
        const { token, user } = res.data.content;

        // Lưu token và user vào localStorage
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Cập nhật context nếu có
        if (typeof login === "function") {
          await login(user.email, token, user);
        }

        message.success("Đăng ký thành công!");
        form.resetFields();
        onSuccess(); // chuyển sang trang chính hoặc đóng modal
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Đăng ký thất bại!";
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
                return !value || getFieldValue("password") === value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Mật khẩu nhập lại không khớp!"));
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

        <Form.Item
          label="Ngày sinh"
          name="birthday"
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
        >
          <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
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
