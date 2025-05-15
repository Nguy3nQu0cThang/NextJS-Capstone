"use client";

import React, { useState } from "react";
import { Form, Input, Button, Modal, DatePicker, Select } from "antd";
import { http } from "app/utils/setting";

const { Option } = Select;

const Register = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [registerStatus, setRegisterStatus] = useState(""); // "success" hoặc "error"
  const [errorMessage, setErrorMessage] = useState(""); // Lưu thông báo lỗi
  const [formValues, setFormValues] = useState(null);

  const onFinish = async (values) => {
    try {
      const { confirmPassword, ...rest } = values;
      const userData = { ...rest };

      console.log("Submitting values:", userData);

      const res = await http.post("/api/auth/signup", userData);
      console.log("API response:", res.data);

      if (res.data.statusCode === 200) {
        setFormValues({ email: values.email, password: values.password });
        localStorage.setItem("userName", values.email);
        localStorage.setItem("tempPassword", values.password);
        setRegisterStatus("success");
        setIsModalVisible(true);
        form.resetFields();
      } else {
        throw new Error("Đăng ký thất bại!");
      }
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      let errorMsg = "Đăng ký thất bại!";
      if (error.response?.data) {
        errorMsg =
          error.response.data.content ||
          error.response.data.message ||
          errorMsg;
      }
      setErrorMessage(errorMsg);
      setRegisterStatus("error");
      setIsModalVisible(true);
    }
  };

  const handleOk = () => {
    setIsModalVisible(false);
    if (
      registerStatus === "success" &&
      typeof onSuccess === "function" &&
      formValues
    ) {
      onSuccess({
        switchToLogin: true,
        email: formValues.email,
        password: formValues.password,
      });
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "15px 0" }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Vui lòng nhập email!" }]}
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
                return Promise.reject(new Error("Mật khẩu không khớp!"));
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

      <Modal
        title="Thông báo"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText="OK"
        cancelText="Hủy"
        okButtonProps={{ disabled: registerStatus === "error" }}
        cancelButtonProps={{className: "custom-cancel-button"}}
      >
        <p style={{ color: registerStatus === "error" ? "red" : "green" }}>
          {registerStatus === "success"
            ? "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập."
            : `Đăng ký thất bại: ${errorMessage}`}
        </p>
      </Modal>
    </div>
  );
};

export default Register;
