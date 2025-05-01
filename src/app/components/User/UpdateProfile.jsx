import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
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
        message.error("Vui lòng đăng nhập để cập nhật hồ sơ.");
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
        message.success("Cập nhật hồ sơ thành công!");
        onSuccess(res.data.content);
        form.resetFields();
        onCancel();
      } else {
        message.error("Cập nhật hồ sơ thất bại!");
      }
    } catch (error) {
      console.error(
        "Cập nhật hồ sơ thất bại:",
        error.response?.data || error.message
      );
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("accessToken");
        showModal("login");
        onCancel();
      } else {
        message.error(
          error.response?.data?.message || "Cập nhật hồ sơ thất bại!"
        );
      }
    }
  };

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
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
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

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateProfile;
