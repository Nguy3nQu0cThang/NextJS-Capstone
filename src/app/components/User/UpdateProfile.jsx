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
  const [notification, setNotification] = useState(null); // State cho thông báo

  console.log("Form instance created:", form);

  useEffect(() => {
    console.log("Modal visible:", visible, "Profile:", profile);
    if (profile) {
      form.setFieldsValue({
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        gender: profile.gender,
      });
    }
  }, [profile, form]);

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setNotification({
          type: "error",
          message: "Vui lòng đăng nhập để cập nhật hồ sơ.",
        });
        showModal("login");
        onCancel();
        return;
      }

      const payload = {
        id: profile?.id || 0,
        email: values.email,
        name: values.name,
        gender: values.gender,
        phone: values.phone,
      };

      console.log("Cập nhật hồ sơ với dữ liệu:", payload);
      const res = await http.post(
        "https://apistore.cybersoft.edu.vn/api/Users/updateProfile",
        payload
      );
      console.log("Cập nhật hồ sơ thành công, response:", res.data);

      if (res.data.statusCode === 200) {
        console.log("Gọi onSuccess với dữ liệu:", res.data.content);
        setNotification({
          type: "success",
          message: "Hồ sơ của bạn đã được cập nhật thành công!",
        });
        onSuccess(res.data.content);
        form.resetFields();
        setTimeout(() => {
          setNotification(null);
          onCancel();
        }, 3000); // Đợi 3 giây để thông báo hiển thị
      } else {
        setNotification({
          type: "error",
          message: "Cập nhật hồ sơ thất bại!",
        });
      }
    } catch (error) {
      console.error(
        "Cập nhật hồ sơ thất bại:",
        error.response?.data || error.message
      );
      if (error.response?.status === 401) {
        setNotification({
          type: "error",
          message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        });
        localStorage.removeItem("accessToken");
        showModal("login");
        onCancel();
      } else {
        setNotification({
          type: "error",
          message: error.response?.data?.message || "Cập nhật hồ sơ thất bại!",
        });
      }
    }
  };

  const onChangePasswordFinish = async (values) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setNotification({
          type: "error",
          message: "Vui lòng đăng nhập để đổi mật khẩu.",
        });
        showModal("login");
        setChangePasswordModalVisible(false);
        return;
      }

      if (values.newPassword !== values.confirmPassword) {
        setNotification({
          type: "error",
          message: "Mật khẩu xác nhận không khớp!",
        });
        return;
      }

      const payload = {
        newPassword: values.newPassword,
      };

      console.log("Đổi mật khẩu với dữ liệu:", payload);
      const res = await http.post(
        "https://apistore.cybersoft.edu.vn/api/Users/changePassword",
        payload
      );
      console.log("Đổi mật khẩu thành công, response:", res.data);

      if (res.data.statusCode === 200) {
        setNotification({
          type: "success",
          message: "Mật khẩu của bạn đã được thay đổi thành công!",
        });
        passwordForm.resetFields();
        setTimeout(() => {
          setNotification(null);
          setChangePasswordModalVisible(false);
        }, 3000); // Đợi 3 giây để thông báo hiển thị
      } else {
        setNotification({
          type: "error",
          message: "Đổi mật khẩu thất bại!",
        });
      }
    } catch (error) {
      console.error(
        "Đổi mật khẩu thất bại:",
        error.response?.data || error.message
      );
      if (error.response?.status === 401) {
        setNotification({
          type: "error",
          message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        });
        localStorage.removeItem("accessToken");
        showModal("login");
        setChangePasswordModalVisible(false);
      } else {
        setNotification({
          type: "error",
          message: error.response?.data?.message || "Đổi mật khẩu thất bại!",
        });
      }
    }
  };

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
              { type: "email", message: "Email không hợp lệ!" },
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

          {notification && (
            <div style={{ marginBottom: "8px" }}>
              <span
                style={{
                  color:
                    notification.type === "success" ? "#52c41a" : "#ff4d4f",
                  fontSize: "12px",
                }}
              >
                {notification.message}
              </span>
            </div>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button
                style={{
                  backgroundColor: "#1890ff",
                  color: "white",
                  fontWeight: "500",
                }}
                onClick={() => {
                  console.log("Mở modal đổi mật khẩu");
                  setChangePasswordModalVisible(true);
                }}
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
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu" />
          </Form.Item>

          {notification && (
            <div style={{ marginBottom: "8px" }}>
              <span
                style={{
                  color:
                    notification.type === "success" ? "#52c41a" : "#ff4d4f",
                  fontSize: "12px",
                }}
              >
                {notification.message}
              </span>
            </div>
          )}

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
