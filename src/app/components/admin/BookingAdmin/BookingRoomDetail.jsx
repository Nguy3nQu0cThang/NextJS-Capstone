"use client";

import React from "react";
import { Table, Button, Card, Image, Modal, Pagination } from "antd";
import {
  faChevronLeft,
  faBed,
  faBath,
  faUsers,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const BookingRoomDetail = ({
  room,
  bookings,
  loading,
  onBack,
  onDeleteBooking,
  getStatusTag,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onEditBooking,
  handleCreateBooking,
}) => {
  const bookingColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80, responsive: ["md"] },
    {
      title: "Người đặt",
      dataIndex: "userDetails",
      key: "userName",
      render: (userDetails) =>
        userDetails?.name ||
        userDetails?.fullName ||
        userDetails?.email ||
        userDetails?.id ||
        "Unknown User",
      width: 150,
    },
    {
      title: "Ngày đến",
      dataIndex: "ngayDen",
      key: "ngayDen",
      render: (text) => new Date(text).toLocaleDateString("vi-VN"),
      width: 120,
      responsive: ["sm"],
    },
    {
      title: "Ngày đi",
      dataIndex: "ngayDi",
      key: "ngayDi",
      render: (text) => new Date(text).toLocaleDateString("vi-VN"),
      width: 120,
      responsive: ["sm"],
    },
    {
      title: "Số khách",
      dataIndex: "soLuongKhach",
      key: "soLuongKhach",
      width: 100,
      responsive: ["md"],
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (status) => getStatusTag(status),
      width: 120,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              console.log("BookingRoomDetail: Editing booking:", record.id);
              onEditBooking(record);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 mr-4"
            style={{ marginRight: "8px" }}
          >
            Sửa
          </Button>
          <Button
            danger
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              console.log("BookingRoomDetail: Deleting booking:", record.id);
              onDeleteBooking(e, record);
            }}
            className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1"
          >
            Xóa
          </Button>
        </div>
      ),
      width: 150,
    },
  ];

  return (
    <Card className="shadow-md rounded-md">
      <Button
        type="link"
        onClick={() => {
          console.log("BookingRoomDetail: Back button clicked.");
          onBack();
        }}
        className="mb-4 flex items-center"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="mr-2" /> Quay lại danh
        sách Phòng
      </Button>
      <div className="flex items-center flex-grow justify-between">
        <h3 className="text-xl font-semibold mr-4">
          Đặt phòng của Phòng: {room.tenPhong}
        </h3>
        <Button
          type="primary"
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={() => {
            console.log(
              "BookingRoomDetail: Add new booking button clicked for room:",
              room.id
            );
            handleCreateBooking(room);
          }}
        >
          + Đặt phòng mới
        </Button>
      </div>
      <div className="flex items-center" style={{ marginBottom: "20px" }}>
        <Image
          src={room.hinhAnh}
          alt="room"
          width={400}
          height={140}
          style={{
            objectFit: "cover",
            borderRadius: "8px",
          }}
          preview={false}
        />
        <div style={{ marginLeft: "50px" }}>
          <p>
            <FontAwesomeIcon
              icon={faUsers}
              className="mr-2 text-blue-500"
              style={{ marginRight: "10px" }}
            />
            Số khách: {room.khach}
          </p>
          <p>
            <FontAwesomeIcon
              icon={faBed}
              className="mr-2 text-blue-500"
              style={{ marginRight: "10px" }}
            />
            Phòng ngủ: {room.phongNgu}
          </p>
          <p>
            <FontAwesomeIcon
              icon={faBath}
              className="mr-2 text-blue-500"
              style={{ marginRight: "10px" }}
            />
            Phòng tắm: {room.phongTam}
          </p>
          <p>
            <FontAwesomeIcon
              icon={faDollarSign}
              className="mr-2 text-blue-500"
              style={{ marginRight: "10px" }}
            />
            Giá/đêm: {room.giaTien}$
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table
          rowKey="id"
          dataSource={bookings}
          columns={bookingColumns}
          pagination={false}
          loading={loading}
          className="bg-white shadow-md rounded-md"
          scroll={{ x: "max-content" }}
        />
      </div>
      {total > 0 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page, pageSize) => {
              console.log(
                `BookingRoomDetail: Pagination changed by AntD to page=${page}, pageSize=${pageSize}`
              );
              onPageChange(page, pageSize);
            }}
            showSizeChanger
            pageSizeOptions={["10", "20", "50"]}
          />
        </div>
      )}
    </Card>
  );
};

export default BookingRoomDetail;
