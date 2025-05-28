"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  message,
  Select,
  Spin,
} from "antd";
import { getAllLocationsDashboard } from "app/services/bookingService";
import { http } from "app/utils/setting";

const { Option } = Select;

const RoomForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const data = await getAllLocationsDashboard();
      setLocations(data);
    } catch (err) {
      message.error("Không thể tải danh sách vị trí!");
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const onFinish = async (values) => {
    try {
      const res = await http.post("/api/phong-thue", values);
      if (res.data.statusCode === 200) {
        message.success("Tạo phòng thành công!");
        form.resetFields();
        if (onSuccess) onSuccess();
      } else {
        throw new Error("Tạo phòng thất bại");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.content || "Tạo phòng thất bại!";
      message.error(errorMsg);
    }
  };

  return (
    <div style={{ padding: "15px 0" }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          khach: 1,
          phongNgu: 1,
          giuong: 1,
          phongTam: 1,
          giaTien: 100,
          mayGiat: false,
          banLa: false,
          tivi: false,
          dieuHoa: false,
          wifi: false,
          bep: false,
          doXe: false,
          hoBoi: false,
          banUi: false,
        }}
      >
        <Form.Item
          label="Tên phòng"
          name="tenPhong"
          rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Mô tả" name="moTa">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Hình ảnh"
          name="hinhAnh"
          rules={[{ required: false, message: "Vui lòng nhập URL hình ảnh!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="maViTri"
          label="Vị trí"
          rules={[{ required: true, message: "Vui lòng chọn vị trí!" }]}
        >
          {loadingLocations ? (
            <Spin />
          ) : (
            <Select placeholder="Chọn vị trí">
              {locations.map((loc) => (
                <Option key={loc.id} value={loc.id}>
                  {`${loc.tenViTri}, ${loc.tinhThanh}, ${loc.quocGia}`}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item label="Giá tiền" name="giaTien">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Số khách" name="khach">
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Số phòng ngủ" name="phongNgu">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Số giường" name="giuong">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Số phòng tắm" name="phongTam">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            "mayGiat",
            "banLa",
            "tivi",
            "dieuHoa",
            "wifi",
            "bep",
            "doXe",
            "hoBoi",
            "banUi",
          ].map((item) => (
            <Form.Item
              key={item}
              name={item}
              label={item}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          ))}
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Tạo phòng
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RoomForm;
