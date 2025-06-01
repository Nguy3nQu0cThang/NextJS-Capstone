"use client";

import React from "react";
import { Table, Input, Button, Pagination, Card, Image } from "antd";

const BookingRoomList = ({
  rooms,
  loading,
  roomSearchTerm,
  handleSearchRoom,
  currentRoomPage,
  roomPageSize,
  totalRooms,
  handleRoomPageChange,
  onSelectRoom,
}) => {
  const roomColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60, responsive: ["md"] },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      render: (text) => (
        <Image
          src={text}
          alt="room"
          width={80}
          height={80}
          style={{ objectFit: "cover", borderRadius: "4px" }}
          preview={false}
        />
      ),
      width: 100,
    },
    { title: "Tên phòng", dataIndex: "tenPhong", key: "tenPhong", width: 200 },
    {
      title: "Khách/phòng",
      dataIndex: "khach",
      key: "khach",
      width: 80,
      responsive: ["sm"],
    },
    {
      title: "Giá/đêm",
      dataIndex: "giaTien",
      key: "giaTien",
      width: 100,
      render: (price) => `${price}$`,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, roomRecord) => (
        <Button
          type="primary"
          onClick={() => {
            console.log("BookingRoomList: Selecting room:", roomRecord.id);
            onSelectRoom(roomRecord);
          }}
        >
          Xem đặt phòng
        </Button>
      ),
      width: 150,
    },
  ];

  return (
    <Card className="shadow-md rounded-md">
      <div className="mb-4">
        <Input.Search
          placeholder="Tìm kiếm phòng theo tên..."
          enterButton="Tìm"
          size="large"
          onSearch={(value) => {
            console.log(
              "BookingRoomList: Input.Search onSearch triggered with value:",
              value
            );
            handleSearchRoom(value);
          }}
          onChange={(e) => {
            handleSearchRoom(e.target.value);
          }}
          value={roomSearchTerm}
          loading={loading}
        />
      </div>
      <div className="overflow-x-auto">
        <Table
          rowKey="id"
          dataSource={rooms}
          columns={roomColumns}
          pagination={false}
          loading={loading}
          className="bg-white shadow-md rounded-md"
          scroll={{ x: "max-content" }}
        />
      </div>
      <div className="mt-4 flex justify-center">
        <Pagination
          current={currentRoomPage}
          pageSize={roomPageSize}
          total={totalRooms}
          onChange={(page, pageSize) => {
            console.log(
              `BookingRoomList: Pagination change to page=${page}, pageSize=${pageSize}`
            );
            handleRoomPageChange(page, pageSize);
          }}
          showSizeChanger
          pageSizeOptions={["10", "20", "50"]}
        />
      </div>
    </Card>
  );
};

export default BookingRoomList;
