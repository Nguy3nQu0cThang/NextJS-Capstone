"use client";

import { createLocation } from "@/app/services/locationService";
import { Modal, Form, Input, message } from "antd";

const AddLocationModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createLocation(values);
      message.success("Thêm vị trí thành công!");
      form.resetFields();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      message.error("Thêm vị trí thất bại.");
    }
  };

  return (
    <Modal
      title="Thêm vị trí mới"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleSubmit}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên vị trí"
          name="tenViTri"
          rules={[{ required: true, message: "Vui lòng nhập tên vị trí!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Tỉnh thành"
          name="tinhThanh"
          rules={[{ required: true, message: "Vui lòng nhập tỉnh thành!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Quốc gia"
          name="quocGia"
          rules={[{ required: true, message: "Vui lòng nhập quốc gia!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Hình ảnh (link)"
          name="hinhAnh"
          rules={[{ required: true, message: "Vui lòng nhập link hình ảnh!" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddLocationModal;
