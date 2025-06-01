"use client";

import { Modal, Form, Input, message } from "antd";
import { updateLocation } from "@/app/services/locationService";
import { useEffect } from "react";

const EditLocationModal = ({ visible, location, onCancel, onSuccess }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && location) {
      form.setFieldsValue(location);
    }
  }, [visible, location]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateLocation(location.id, values);
      message.success("Cập nhật vị trí thành công!");
      form.resetFields();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại.");
    }
  };

  return (
    <Modal
      title="Chỉnh sửa vị trí"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleSubmit}
      okText="Cập nhật"
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

export default EditLocationModal;
