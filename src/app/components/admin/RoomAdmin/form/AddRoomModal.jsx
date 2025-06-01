"use client";

import {
  Modal,
  Form,
  Input,
  InputNumber,
  Checkbox,
  Button,
  message,
  Select,
} from "antd";
import { useState, useEffect } from "react";
import { http } from "@/app/utils/setting";
import { getAllLocations } from "@/app/services/bookingService";

const AddRoomModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLocations, setFetchingLocations] = useState(false);

  useEffect(() => {
    if (visible) {
      setFetchingLocations(true);
      getAllLocations()
        .then((data) => {
          console.log("API Location Data:", data);
          if (data && Array.isArray(data.content) && data.content.length > 0) {
            const validLocations = data.content.filter(
              (loc) =>
                loc.id != null &&
                loc.tenViTri?.trim() &&
                loc.tinhThanh?.trim() &&
                loc.quocGia?.trim()
            );
            if (validLocations.length === 0) {
              message.warning("Dữ liệu vị trí không hợp lệ hoặc rỗng.");
            }
            setLocations(validLocations);
          } else {
            message.error("Dữ liệu vị trí không đúng định dạng.");
            setLocations([]);
          }
        })
        .catch((err) => {
          console.error(
            "Lỗi fetchLocations:",
            err.response?.data || err.message
          );
          message.error("Không thể lấy danh sách vị trí. Vui lòng thử lại.");
          setLocations([]);
        })
        .finally(() => setFetchingLocations(false));

      // Reset form và đặt amenities mặc định
      form.resetFields();
      form.setFieldsValue({ amenities: [] });
      console.log("Form initial values:", form.getFieldsValue()); // Debug initial values
    }
  }, [visible, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      console.log("Form values:", values); // Debug toàn bộ values
      console.log("Amenities from form:", values.amenities); // Debug amenities

      const amenities = {
        wifi: false,
        mayGiat: false,
        bep: false,
        tivi: false,
        dieuHoa: false,
        doXe: false,
        hoBoi: false,
        banLa: false,
        banUi: false,
      };

      // Xử lý amenities
      if (Array.isArray(values.amenities)) {
        values.amenities.forEach((amenity) => {
          if (Object.prototype.hasOwnProperty.call(amenities, amenity)) {
            amenities[amenity] = true;
          } else {
            console.warn(`Amenity không hợp lệ: ${amenity}`);
          }
        });
      } else {
        console.error("Amenities không phải mảng:", values.amenities);
        message.error("Dữ liệu tiện ích không hợp lệ!");
        setLoading(false);
        return;
      }

      const payload = {
        ...values,
        ...amenities,
        amenities: undefined,
        hinhAnh: "", // API không cần hinhAnh
      };
      console.log("Payload gửi đi:", payload); // Debug payload
      const response = await http.post("/api/phong-thue", payload);
      message.success("Thêm phòng thành công!");
      form.resetFields();
      form.setFieldsValue({ amenities: [] });
      onSuccess(response.data.content);
      onCancel();
    } catch (err) {
      console.error("Lỗi thêm phòng:", err.response?.data || err.message);
      message.error(
        err.response?.data?.message || "Thêm phòng thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    form.resetFields();
    form.setFieldsValue({ amenities: [] });
    onCancel();
  };

  return (
    <Modal
      title={
        <span className="text-xl font-semibold text-[#fe6b6e]">Thêm Phòng</span>
      }
      open={visible}
      footer={null}
      onCancel={handleModalClose}
      destroyOnHidden
      width={700}
      className="max-w-[100vw]"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Form.Item
          label="Tên Phòng"
          name="tenPhong"
          className="font-bold"
          rules={[{ required: true, message: "Tên phòng là bắt buộc!" }]}
        >
          <Input placeholder="Nhập tên phòng" />
        </Form.Item>

        <Form.Item
          label="Vị Trí"
          name="maViTri"
          className="font-bold"
          rules={[{ required: true, message: "Vị trí là bắt buộc!" }]}
        >
          <Select
            placeholder="Chọn vị trí"
            loading={fetchingLocations}
            disabled={fetchingLocations}
            allowClear
          >
            {locations.length > 0 ? (
              locations.map(
                (location) =>
                  location.id != null && (
                    <Select.Option key={location.id} value={location.id}>
                      {location.tenViTri &&
                      location.tinhThanh &&
                      location.quocGia
                        ? `${location.tenViTri}, ${location.tinhThanh}, ${location.quocGia}`
                        : "Dữ liệu vị trí không đầy đủ"}
                    </Select.Option>
                  )
              )
            ) : (
              <Select.Option disabled value="">
                Không có vị trí nào
              </Select.Option>
            )}
          </Select>
        </Form.Item>

        <div className="flex justify-between gap-4">
          <Form.Item
            label="Số Khách"
            name="khach"
            className="font-bold"
            rules={[
              { required: true, message: "Tối thiểu 1 khách!" },
              { type: "number", min: 1 },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
          <Form.Item
            label="Phòng Ngủ"
            name="phongNgu"
            className="font-bold"
            rules={[
              { required: true, message: "Tối thiểu 1 phòng ngủ!" },
              { type: "number", min: 1 },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
        </div>

        <div className="flex justify-between gap-4">
          <Form.Item
            label="Giường"
            name="giuong"
            className="font-bold"
            rules={[
              { required: true, message: "Tối thiểu 1 giường!" },
              { type: "number", min: 1 },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
          <Form.Item
            label="Phòng Tắm"
            name="phongTam"
            className="font-bold"
            rules={[
              { required: true, message: "Tối thiểu 1 phòng tắm!" },
              { type: "number", min: 1 },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
        </div>

        <Form.Item
          name="amenities"
          className="col-span-1 md:col-span-2"
          rules={[
            {
              validator: (_, value) =>
                Array.isArray(value) && value.length > 0
                  ? Promise.resolve()
                  : Promise.reject(new Error("Chọn ít nhất 1 tiện ích!")),
            },
          ]}
        >
          <div className="font-bold mb-3">Tiện nghi:</div>
          <Checkbox.Group
            onChange={(checkedValues) => {
              console.log("Checkbox checked:", checkedValues);
              form.setFieldsValue({ amenities: checkedValues }); // Đồng bộ form
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              <Checkbox value="wifi">Wifi</Checkbox>
              <Checkbox value="tivi">TV</Checkbox>
              <Checkbox value="dieuHoa">Điều hòa</Checkbox>
              <Checkbox value="mayGiat">Máy giặt</Checkbox>
              <Checkbox value="banLa">Bàn là</Checkbox>
              <Checkbox value="bep">Bếp</Checkbox>
              <Checkbox value="doXe">Bãi đỗ xe</Checkbox>
              <Checkbox value="hoBoi">Hồ bơi</Checkbox>
              <Checkbox value="banUi">Bàn ủi</Checkbox>
            </div>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item
          label="Giá Tiền (VND):"
          name="giaTien"
          className="font-bold"
          rules={[
            { required: true, message: "Giá tiền là bắt buộc!" },
            { type: "number", min: 0 },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/(,*)/g, "")}
          />
        </Form.Item>

        <Form.Item
          label="Mô Tả"
          name="moTa"
          className="font-bold col-span-1 md:col-span-2"
        >
          <Input.TextArea
            placeholder="Nhập mô tả phòng"
            rows={4}
            maxLength={500}
          />
        </Form.Item>

        <div className="col-span-1 md:col-span-2 mb-8">
          <div className="font-bold mb-2">Hình ảnh:</div>
          <div className="w-full min-h-[150px] md:min-h-[200px] relative bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50 text-sm md:text-lg">
              Vui lòng cập nhật sau khi thêm thành công
            </span>
          </div>
        </div>

        <Form.Item className="col-span-1 md:col-span-2 flex justify-end gap-2 mb-0">
          <Button onClick={handleModalClose}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ backgroundColor: "#fe6b6e", borderColor: "#fe6b6e" }}
          >
            Thêm
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddRoomModal;
