"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, Space, DatePicker } from "antd";
import { http } from "app/utils/setting";
import dayjs from "dayjs";

const { Option } = Select;

const UpdateProfile = ({
  visible,
  onCancel,
  profile,
  onSuccess,
  showModal,
}) => {
  const [form] = Form.useForm();
  const [notification, setNotification] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage (nếu có)
    const userFromStorage = localStorage.getItem("userProfile");
    if (userFromStorage) {
      setCurrentUser(JSON.parse(userFromStorage));
    }
  }, []);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        birthday: profile.birthday ? dayjs(profile.birthday) : null,
        gender: profile.gender,
        role: profile.role,
      });
    }
  }, [profile, form]);

  const handleNotification = (type, message) =>
    setNotification({ type, message });

  const handleError = (error, loginRedirect = false) => {
    const message = error.response?.data?.message || "Có lỗi xảy ra!";
    handleNotification("error", message);
    if (error.response?.status === 401 && loginRedirect) {
      localStorage.removeItem("token");
      showModal("login");
      onCancel();
    }
  };

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        handleNotification("error", "Vui lòng đăng nhập để cập nhật hồ sơ.");
        showModal("login");
        onCancel();
        return;
      }

      const payload = {
        ...profile,
        ...values,
        birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,
      };

      const res = await http.put(`/api/users/${profile.id}`, payload);
      if (res.data.statusCode === 200) {
        handleNotification("success", "Hồ sơ của bạn đã được cập nhật thành công!");
        onSuccess(res.data.content);
        form.resetFields();
        setTimeout(() => {
          setNotification(null);
          onCancel();
        }, 3000);
      } else {
        handleNotification("error", "Cập nhật hồ sơ thất bại!");
      }
    } catch (error) {
      handleError(error, true);
    }
  };

  const renderNotification = () =>
    notification && (
      <div style={{ marginBottom: 8 }}>
        <span
          style={{
            color: notification.type === "success" ? "#52c41a" : "#ff4d4f",
            fontSize: 12,
          }}
        >
          {notification.message}
        </span>
      </div>
    );

  return (
    <Modal
      title="Cập nhật hồ sơ"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ gender: true }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email" },
          ]}
        >
          <Input placeholder="Nhập email" />
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

        <Form.Item
          label="Giới tính"
          name="gender"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select>
            <Option value={true}>Nam</Option>
            <Option value={false}>Nữ</Option>
          </Select>
        </Form.Item>

        {/* Chỉ hiển thị khi người dùng hiện tại là ADMIN */}
        {currentUser?.role === "ADMIN" && (
          <Form.Item
            label="Loại người dùng"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn loại người dùng!" }]}
          >
            <Select>
              <Option value="ADMIN">ADMIN</Option>
              <Option value="USER">USER</Option>
            </Select>
          </Form.Item>
        )}

        {renderNotification()}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateProfile;
