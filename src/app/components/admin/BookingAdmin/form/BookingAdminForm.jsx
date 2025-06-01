import { Modal, Form, InputNumber, DatePicker, Button, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import { updateBooking } from "@/app/services/bookingService";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect } from "react";

dayjs.extend(customParseFormat);


const BookingAdminForm = ({
  visible,
  onCancel,
  booking,
  room,
  isSmallScreen,
  getStatusTag,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    console.log("BookingAdminForm useEffect: booking or visible changed", {
      booking,
      visible,
      room,
    });
    if (booking && visible && room) {
      form.setFieldsValue({
        ngayDen: dayjs(booking.ngayDen),
        ngayDi: dayjs(booking.ngayDi),
        soLuongKhach: booking.soLuongKhach,
      });
      form.setFieldsValue({
        totalPriceDisplay: calculateTotal(form.getFieldsValue()),
      });
    } else if (!visible) {
      form.resetFields();
    }
  }, [booking, form, visible, room]);

  const calculateDays = (start, end) => {
    const diff = dayjs(end)
      .startOf("day")
      .diff(dayjs(start).startOf("day"), "day");
    return diff >= 0 ? diff + 1 : 0;
  };

  const calculateTotal = (values) => {
    console.log("--- calculateTotal values ---");
    console.log("values.ngayDen:", values.ngayDen ? values.ngayDen.format("DD/MM/YYYY") : null);
    console.log("values.ngayDi:", values.ngayDi ? values.ngayDi.format("DD/MM/YYYY") : null);
    console.log("room?.giaTien:", room?.giaTien);
    console.log("values.soLuongKhach:", values.soLuongKhach);
    console.log("---------------------------");

    if (
      !values.ngayDen ||
      !values.ngayDi ||
      !room?.giaTien ||
      !values.soLuongKhach
    ) {
      console.log("One or more required values are missing. Returning 0.");
      return 0;
    }

    const days = calculateDays(values.ngayDen, values.ngayDi);
    console.log("Calculated days:", days);

    const totalPrice = days * room.giaTien * values.soLuongKhach;
    console.log("Calculated total price:", totalPrice);
    return totalPrice;
  };

  const getUserDisplay = (userDetails) =>
    userDetails?.name ||
    userDetails?.fullName ||
    userDetails?.email ||
    userDetails?.id ||
    "";

  const onFinish = async (values) => {
    try {
      const payload = {
        id: booking.id,
        maPhong: booking.maPhong,
        ngayDen: values.ngayDen.toISOString(),
        ngayDi: values.ngayDi.toISOString(),
        soLuongKhach: values.soLuongKhach,
        maNguoiDung: booking.maNguoiDung,
      };

      await updateBooking(booking.id, payload);

      message.success("Cập nhật đặt phòng thành công!");
      onSuccess?.();
    } catch (error) {
      message.error("Cập nhật thất bại!");
      console.error(error);
    }
  };

  const validateNgayDi = (_, value) => {
    const ngayDen = form.getFieldValue("ngayDen");
    if (!value || !ngayDen) {
      return Promise.resolve();
    }
    if (dayjs(value).isBefore(dayjs(ngayDen), "day")) {
      return Promise.reject(new Error("Ngày đi không được nhỏ hơn ngày đến"));
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title="Chỉnh sửa đặt phòng"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={isSmallScreen ? "90%" : 600}
      className="rounded-lg"
      destroyOnClose={true}
    >
      {booking && room ? (
        <div className="p-3 sm:p-4">
          <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
            Cập nhật đặt phòng ID: <strong>{booking.id}</strong>.
          </p>

          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            onValuesChange={(changedValues, allValues) => {
              if (
                "ngayDen" in changedValues ||
                "ngayDi" in changedValues ||
                "soLuongKhach" in changedValues
              ) {
                form.setFieldsValue({
                  totalPriceDisplay: calculateTotal(allValues),
                });
              }
            }}
          >
            <div className="mb-2">
              <FontAwesomeIcon
                icon={faHome}
                className="mr-2 text-blue-500"
                style={{ marginRight: "8px" }}
              />
              <span className="font-semibold">Phòng:</span>{" "}
              {room?.tenPhong || booking.maPhong}
            </div>

           <div className="mb-2">
              <FontAwesomeIcon
                icon={faUser}
                className="mr-2 text-blue-500"
                style={{ marginRight: "8px" }}
              />
              <span className="font-semibold">Người đặt:</span>{" "}
              {getUserDisplay(booking.userDetails)}
            </div>

            <Form.Item
              label="Ngày đến"
              name="ngayDen"
              rules={[{ required: true, message: "Vui lòng chọn ngày đến" }]}
            >
              <DatePicker format="DD/MM/YYYY" className="w-full" />
            </Form.Item>

            <Form.Item
              label="Ngày đi"
              name="ngayDi"
              dependencies={["ngayDen"]}
              rules={[
                { required: true, message: "Vui lòng chọn ngày đi" },
                { validator: validateNgayDi },
              ]}
            >
              <DatePicker format="DD/MM/YYYY" className="w-full" />
            </Form.Item>

            <Form.Item
              label="Số lượng khách"
              name="soLuongKhach"
              rules={[
                { required: true, message: "Vui lòng nhập số khách" },
                { type: "number", min: 1, message: "Ít nhất 1 khách" },
              ]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>

            <Form.Item label="Tổng tiền" name="totalPriceDisplay">
              <InputNumber
                readOnly
                className="w-full text-lg font-semibold text-blue-600"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " $"
                } 
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                style={{
                  color: "#2563EB",
                  fontWeight: "bold",
                  fontSize: "1.125rem", 
                }}
                prefix={<FontAwesomeIcon icon={faMoneyBillWave} />} 
              />
            </Form.Item>

            <div className="mb-4">
              <span className="font-semibold">Trạng thái:</span>{" "}
              {getStatusTag(booking.trangThai)}
            </div>

            <Form.Item>
              <div className="flex justify-end gap-2">
                <Button onClick={onCancel} style={{ marginRight: "8px" }}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Lưu thay đổi
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          Đang tải thông tin đặt phòng...
        </div>
      )}
    </Modal>
  );
};

export default BookingAdminForm;
