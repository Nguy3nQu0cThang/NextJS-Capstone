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
  Upload,
} from "antd";
import { useState, useEffect } from "react";
import { http } from "@/app/utils/setting";
import {
  getAllLocations,
  uploadRoomImage,
} from "@/app/services/bookingService";
import { UploadOutlined } from "@ant-design/icons";

const EditRoomModal = ({ visible, onCancel, onSuccess, room }) => {
  const [form] = Form.useForm();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLocations, setFetchingLocations] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const defaultImage = "https://picsum.photos/200/300?random=1";

  const validateImageUrl = (url) => {
    return new Promise((resolve) => {
      if (!url || url.trim() === "") {
        resolve(true);
        return;
      }
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  const handleModalClose = () => {
    form.resetFields();
    setFileList([]);
    setPreviewImage(null);
    setUploadedFileUrl(null);
    setSelectedAmenities([]);
    onCancel();
  };

  useEffect(() => {
    if (visible && locations.length === 0) {
      setFetchingLocations(true);
      getAllLocations()
        .then((data) => {
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
    }
  }, [visible, locations.length]);

  useEffect(() => {
    if (visible && room) {
      setUploadedFileUrl(null);
      setFileList([]);
      setPreviewImage(null);

      const initialAmenitiesArray = [];
      if (room.wifi) initialAmenitiesArray.push("wifi");
      if (room.mayGiat) initialAmenitiesArray.push("mayGiat");
      if (room.bep) initialAmenitiesArray.push("bep");
      if (room.tivi) initialAmenitiesArray.push("tivi");
      if (room.dieuHoa) initialAmenitiesArray.push("dieuHoa");
      if (room.doXe) initialAmenitiesArray.push("doXe");
      if (room.hoBoi) initialAmenitiesArray.push("hoBoi");
      if (room.banLa) initialAmenitiesArray.push("banLa");
      if (room.banUi) initialAmenitiesArray.push("banUi");

      setSelectedAmenities(initialAmenitiesArray);

      form.setFieldsValue({
        tenPhong: room.tenPhong || "",
        maViTri: room.maViTri || undefined,
        khach: room.khach || 1,
        phongNgu: room.phongNgu || 1,
        giuong: room.giuong || 1,
        phongTam: room.phongTam || 1,
        giaTien: room.giaTien || 0,
        moTa: room.moTa || "",
        hinhAnhUrl: room.hinhAnh || "",
      });

      if (room.hinhAnh) {
        setFileList([
          {
            uid: "-1",
            name: "current_image.png",
            status: "done",
            url: room.hinhAnh,
          },
        ]);
        setPreviewImage(room.hinhAnh);
      } else {
        setFileList([]);
        setPreviewImage(defaultImage);
      }
    }
  }, [visible, room, form]);

  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    const isImage = file.type.startsWith("image/");
    const isLt5M = file.size / 1024 / 1024 < 5;

    if (!isImage) {
      message.error("Chỉ được upload file ảnh!");
      onError("Invalid file type");
      return;
    }
    if (!isLt5M) {
      message.error("Ảnh phải nhỏ hơn 5MB!");
      onError("File size too large");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("formFile", file);

    try {
      const uploadResponse = await uploadRoomImage(room.id, formData);
      if (
        uploadResponse?.statusCode === 200 &&
        uploadResponse.content?.hinhAnh
      ) {
        const newUrl = uploadResponse.content.hinhAnh;
        setUploadedFileUrl(newUrl);
        setFileList([
          { uid: file.uid, name: file.name, status: "done", url: newUrl },
        ]);
        setPreviewImage(newUrl);
        message.success(`${file.name} upload thành công!`);
        onSuccess(uploadResponse.content, file);
      } else {
        throw new Error(
          uploadResponse?.message || "API upload ảnh không trả về URL."
        );
      }
    } catch (err) {
      console.error(
        "Lỗi upload ảnh qua customRequest:",
        err.response?.data || err.message
      );
      message.error(
        `${file.name} upload thất bại: ${
          err.response?.data?.message || err.message
        }`
      );
      onError(err);
      setUploadedFileUrl(null);
      setFileList([]);
      setPreviewImage(defaultImage);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setPreviewImage(defaultImage);
      setUploadedFileUrl(null);
      form.setFieldsValue({ hinhAnhUrl: "" });
    },
    customRequest: handleCustomUpload,
    fileList,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    onPreview: async (file) => {
      if (file.url) {
        const isValid = await validateImageUrl(file.url);
        if (!isValid) {
          message.error("Hình ảnh không thể hiển thị! Vui lòng kiểm tra URL.");
          setPreviewImage(defaultImage);
        }
      }
    },
    maxCount: 1,
    listType: "picture",
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const amenitiesFlags = {
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

      if (Array.isArray(selectedAmenities)) {
        selectedAmenities.forEach((amenity) => {
          if (Object.prototype.hasOwnProperty.call(amenitiesFlags, amenity)) {
            amenitiesFlags[amenity] = true;
          } else {
            console.warn(`Amenity không hợp lệ: ${amenity}`);
          }
        });
      } else {
        message.error("Dữ liệu tiện ích không hợp lệ!");
        setLoading(false);
        return;
      }

      let finalImageUrl = room.hinhAnh || defaultImage;

      if (uploadedFileUrl) {
        finalImageUrl = uploadedFileUrl;
      } else if (values.hinhAnhUrl && values.hinhAnhUrl.trim() !== "") {
        const isValid = await validateImageUrl(values.hinhAnhUrl);
        if (!isValid) {
          message.error(
            "URL hình ảnh không hợp lệ hoặc không phải ảnh! Vui lòng nhập URL ảnh trực tiếp (kết thúc bằng .jpg, .png, v.v.)."
          );
          setLoading(false);
          return;
        }
        finalImageUrl = values.hinhAnhUrl;
      } else {
        finalImageUrl = room.hinhAnh || defaultImage;
      }

      const payload = {
        ...values,
        ...amenitiesFlags,
        hinhAnh: finalImageUrl,
        hinhAnhUrl: undefined,
        id: room.id,
      };

      const response = await http.put(`/api/phong-thue/${room.id}`, payload);
      let updatedRoom = response.data.content;

      message.success("Cập nhật phòng thành công!");
      form.resetFields();
      setFileList([]);
      setPreviewImage(null);
      setUploadedFileUrl(null);
      setSelectedAmenities([]);
      onSuccess(updatedRoom);
      onCancel();
    } catch (err) {
      console.error("Lỗi cập nhật phòng:", err.response?.data || err.message);
      message.error(
        err.response?.data?.message ||
          "Cập nhật phòng thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      key={room ? room.id : "edit-room-modal"}
      title={
        <span className="text-xl font-semibold text-[#fe6b6e]">
          Chỉnh sửa Phòng
        </span>
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
          className="col-span-1 md:col-span-2"
          rules={[
            {
              validator: () =>
                selectedAmenities.length > 0
                  ? Promise.resolve()
                  : Promise.reject(new Error("Chọn ít nhất 1 tiện ích!")),
            },
          ]}
        >
          <div className="font-bold mb-3">Tiện nghi:</div>
          <Checkbox.Group
            value={selectedAmenities}
            onChange={(checkedValues) => {
              setSelectedAmenities(checkedValues);
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

        <Form.Item
          label="URL Hình ảnh"
          name="hinhAnhUrl"
          className="font-bold col-span-1 md:col-span-2"
          rules={[
            {
              type: "url",
              message: "Vui lòng nhập URL hợp lệ!",
              validateTrigger: "onBlur",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || value.trim() === "") {
                  return Promise.resolve();
                }
                if (/\.(jpeg|jpg|gif|png|bmp|webp|svg)$/i.test(value.trim())) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                    "URL phải là hình ảnh (jpeg, jpg, gif, png, bmp, webp, svg)!"
                  )
                );
              },
            }),
          ]}
        >
          <Input placeholder="Nhập URL hình ảnh trực tiếp (.jpg, .png, ...)" />
        </Form.Item>

        <Form.Item
          label="Hình ảnh (File)"
          className="col-span-1 md:col-span-2 mb-8"
        >
          <Upload {...uploadProps} listType="picture" maxCount={1}>
            <Button icon={<UploadOutlined />}>Chọn file ảnh</Button>
          </Upload>
        </Form.Item>

        <Form.Item className="col-span-1 md:col-span-2 flex justify-end gap-2 mb-0">
          <Button onClick={handleModalClose}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ backgroundColor: "#fe6b6e", borderColor: "#fe6b6e" }}
          >
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditRoomModal;
