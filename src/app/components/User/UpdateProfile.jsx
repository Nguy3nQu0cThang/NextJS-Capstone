import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, Space } from "antd";
import { http } from "app/utils/setting";

const { Option } = Select;

const UpdateProfile = ({
  visible,
  onCancel,
  profile,
  onSuccess,
  showModal,
}) => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        gender: profile.gender,
      });
    }
  }, [profile, form]);

  const handleNotification = (type, message) =>
    setNotification({ type, message });

  const handleError = (error, loginRedirect = false) => {
    const message = error.response?.data?.message || "Có lỗi xảy ra!";
    handleNotification("error", message);
    if (error.response?.status === 401 && loginRedirect) {
      localStorage.removeItem("accessToken");
      showModal("login");
      onCancel();
    }
  };

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        handleNotification("error", "Vui lòng đăng nhập để cập nhật hồ sơ.");
        showModal("login");
        onCancel();
        return;
      }

      const payload = {
        id: profile?.id || 0,
        ...values,
      };

      const res = await http.post(
        "https://apistore.cybersoft.edu.vn/api/Users/updateProfile",
        payload
      );

      if (res.data.statusCode === 200) {
        handleNotification(
          "success",
          "Hồ sơ của bạn đã được cập nhật thành công!"
        );
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

  const onChangePasswordFinish = async ({ newPassword, confirmPassword }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        handleNotification("error", "Vui lòng đăng nhập để đổi mật khẩu.");
        showModal("login");
        setChangePasswordModalVisible(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        handleNotification("error", "Mật khẩu xác nhận không khớp!");
        return;
      }

      const res = await http.post(
        "https://apistore.cybersoft.edu.vn/api/Users/changePassword",
        { newPassword }
      );

      if (res.data.statusCode === 200) {
        handleNotification(
          "success",
          "Mật khẩu của bạn đã được thay đổi thành công!"
        );
        passwordForm.resetFields();
        setTimeout(() => {
          setNotification(null);
          setChangePasswordModalVisible(false);
        }, 3000);
      } else {
        handleNotification("error", "Đổi mật khẩu thất bại!");
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
    <>
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
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
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

          {renderNotification()}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button
                style={{
                  backgroundColor: "#1890ff",
                  color: "white",
                  fontWeight: 500,
                }}
                onClick={() => setChangePasswordModalVisible(true)}
              >
                Đổi mật khẩu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Đổi mật khẩu"
        open={changePasswordModalVisible}
        onCancel={() => {
          passwordForm.resetFields();
          setChangePasswordModalVisible(false);
        }}
        footer={null}
        width={400}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={onChangePasswordFinish}
        >
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6 },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value || getFieldValue("newPassword") === value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp!")
                      );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu" />
          </Form.Item>

          {renderNotification()}

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateProfile;
