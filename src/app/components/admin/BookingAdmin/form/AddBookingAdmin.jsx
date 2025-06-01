"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  message,
  AutoComplete,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { bookRoom } from "@/app/services/bookingService";
import { useAuth } from "app/context/AuthContext"; 
import { getAllUsersPaging } from "@/app/services/userService";
import pLimit from "p-limit";

const { RangePicker } = DatePicker;

const AddBookingAdmin = ({ room, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const { userProfile } = useAuth();
  const [usersOptions, setUsersOptions] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [dates, setDates] = useState([]);
  const [hackValue, setHackValue] = useState(null);

  useEffect(() => {
    if (room && room.id) {
      form.setFieldsValue({
        maPhong: room.id,
        soLuongKhach: room.khach || 1,
      });
    }
  }, [room, form]);

  const fetchAllUsersForSearch = useCallback(async () => {
    setFetchingUsers(true);
    const fetchedUsers = [];
    let hasMore = true;
    let pageIndex = 1;
    const tempPageSize = 50;
    const limit = pLimit(5);

    try {
      while (hasMore) {
        const userData = await limit(() =>
          getAllUsersPaging(pageIndex, tempPageSize)
        );
        if (
          userData &&
          userData.content &&
          Array.isArray(userData.content.data)
        ) {
          const usersContent = userData.content.data;
          usersContent.forEach((user) => {
            if (user?.id) {
              const displayName = user.name || user.fullName || user.email;
              fetchedUsers.push({
                value: String(user.id), 
                label: `${displayName} (ID: ${user.id})`, 
                userName: displayName, 
                originalUser: user,
              });
            }
          });

          if (
            usersContent.length < tempPageSize ||
            pageIndex * tempPageSize >= userData.content.totalRow
          ) {
            hasMore = false;
          } else {
            pageIndex++;
          }
        } else {
          hasMore = false;
        }
      }
      setUsersOptions(fetchedUsers);
    } catch (error) {
      message.error("Không thể tải danh sách người dùng.");
      console.error("Lỗi khi tải người dùng:", error);
      setUsersOptions([]);
    } finally {
      setFetchingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsersForSearch();
  }, [fetchAllUsersForSearch]);

  const onFinish = async (values) => {
    try {
      const { maPhong, ngayDenDi, soLuongKhach, maNguoiDung } = values;

      if (!ngayDenDi || ngayDenDi.length !== 2) {
        message.error("Vui lòng chọn ngày đến và ngày đi.");
        return;
      }

      const ngayDen = ngayDenDi[0].toISOString();
      const ngayDi = ngayDenDi[1].toISOString();

      const finalMaNguoiDung = Number(maNguoiDung); 

      if (isNaN(finalMaNguoiDung) || !finalMaNguoiDung) {
        message.error("Không thể xác định mã người dùng hợp lệ.");
        return;
      }

      const bookingData = {
        id: 0,
        maPhong: Number(maPhong),
        ngayDen: ngayDen,
        ngayDi: ngayDi,
        soLuongKhach: Number(soLuongKhach),
        maNguoiDung: finalMaNguoiDung,
      };

      console.log("Dữ liệu đặt phòng gửi đi:", bookingData);

      await bookRoom(bookingData);
      message.success("Đặt phòng mới thành công!");
      onSuccess();
    } catch (error) {
      console.error("Lỗi khi tạo đặt phòng:", error);
      message.error(
        error.response?.data?.message || "Đặt phòng thất bại. Vui lòng thử lại."
      );
    }
  };

  const disabledRangeDate = (current) => {
    if (current && current < dayjs().startOf("day")) {
      return true;
    }
    if (dates.length === 0) {
      return false; 
    }

    const tooLate =
      dates[0] && current.isAfter(dates[0].add(365, "day"), "day");
    const tooEarly = dates[1] && current.isBefore(dates[1], "day");

    if (tooEarly || tooLate) {
      return true;
    }
    return false;
  };

  const filterUserOptions = (inputValue, option) => {
    return option.label.toUpperCase().includes(inputValue.toUpperCase());
  };

  const handleUserSearchOrSelect = (value, option) => {
    if (option && option.label) {
      form.setFieldsValue({
        maNguoiDung: value,
        maNguoiDungDisplay: option.label,
        userName: option.userName, 
      });
    } else {
      form.setFieldsValue({
        maNguoiDung: value,
        maNguoiDungDisplay: value,
        userName: undefined, 
      });
    }
  };

  const onDateChange = (value) => {
    setDates(value); 
    form.setFieldsValue({ ngayDenDi: value }); 
  };

  const onOpenChange = (open) => {
    if (open) {
      setHackValue([null, null]); 
    } else {
      setHackValue(null); 
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name="add_booking_admin_form"
      onFinish={onFinish}
      initialValues={{
        soLuongKhach: 1,
      }}
    >
      <Form.Item
        name="maPhong"
        label="Mã Phòng"
        rules={[{ required: true, message: "Vui lòng nhập mã phòng!" }]}
      >
        <Input disabled />
      </Form.Item>

      <Form.Item
        name="ngayDenDi"
        label="Ngày Đến - Ngày Đi"
        rules={[
          { required: true, message: "Vui lòng chọn ngày đến và ngày đi!" },
        ]}
      >
        <RangePicker
          style={{ width: "100%" }}
          format="YYYY-MM-DD"
          disabledDate={disabledRangeDate}
          value={hackValue || dates}
          onCalendarChange={(val) => setDates(val)}
          onChange={onDateChange}
          onOpenChange={onOpenChange} 
        />
      </Form.Item>

      <Form.Item
        name="soLuongKhach"
        label="Số Lượng Khách"
        rules={[{ required: true, message: "Vui lòng nhập số lượng khách!" }]}
      >
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="maNguoiDung"
        hidden
        rules={[
          { required: true, message: "Vui lòng chọn người dùng đặt!" },
          {
            type: "number",
            transform: (value) => Number(value),
            message: "Mã người dùng phải là số!",
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="maNguoiDungDisplay"
        label="Tên Người Đặt"
        rules={[{ required: true, message: "Vui lòng chọn người dùng đặt!" }]}
      >
        <AutoComplete
          options={usersOptions}
          filterOption={filterUserOptions}
          onSelect={(value, option) => {
            handleUserSearchOrSelect(value, option);
          }}
          onSearch={(value) => {
            handleUserSearchOrSelect(value);
          }}
          allowClear
          onClear={() => {
            form.setFieldsValue({
              maNguoiDung: undefined,
              maNguoiDungDisplay: undefined,
              userName: undefined,
            });
          }}
          placeholder={
            fetchingUsers
              ? "Đang tải danh sách người dùng..."
              : "Tìm kiếm người dùng"
          }
          notFoundContent={
            fetchingUsers ? <Spin size="small" /> : "Không tìm thấy người dùng"
          }
          style={{ width: "100%" }}
        >
          <Input />
        </AutoComplete>
      </Form.Item>

      <Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" style={{marginLeft: "8px"}}>
            Đặt Phòng
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default AddBookingAdmin;
