"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Pagination,
  message,
  Popconfirm,
  Tag,
  Modal,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  getAllRoomsPaging,
  deleteRoomById,
  getAllBookings,
} from "app/services/bookingService";
import RoomForm from "./form/RoomForm";

const RoomAdmin = () => {
  const [rooms, setRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRooms = async (pageIndex, pageSize, keyword) => {
    setLoading(true);
    try {
      const [roomRes, bookings] = await Promise.all([
        getAllRoomsPaging(page, pageSize, keyword),
        getAllBookings(),
      ]);
      if (roomRes.statusCode === 200) {
        const rooms = roomRes.content.data;
        const roomStatus = rooms.map((room) => {
          const isBooked = bookings.some(
            (booking) => booking.maPhong === room.id
          );
          return { ...room, isBooked };
        });
        setRooms(roomStatus);
        setTotal(roomRes.content.totalRow);
      } else {
        message.error("Không thể tải danh sách phòng!");
      }
    } catch (err) {
      message.error("Lỗi khi tải danh sách phòng!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(page, pageSize, keyword);
  }, [page, pageSize, keyword]);

  const handleSearch = () => {
    setPage(1);
    fetchRooms(1, pageSize, keyword);
  };

  const handlePaginationChange = (newPage, newSize) => {
    setPage(newPage);
    setPageSize(newSize);
    fetchRooms(newPage, newSize, keyword);
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await deleteRoomById(roomId);
      message.success("Xóa phòng thành công!");
      fetchRooms(page, pageSize, keyword);
    } catch (err) {
      message.error("Không thể xóa phòng!");
      console.error(err);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên phòng", dataIndex: "tenPhong", key: "tenPhong" },
    { title: "Vị trí", dataIndex: "maViTri", key: "maViTri" },
    { title: "Giá tiền", dataIndex: "giaTien", key: "giaTien" },
    {
      title: "Trạng thái",
      key: "status",
      render: (record) =>
        record.isBooked ? (
          <Tag color="red">Đã được đặt</Tag>
        ) : (
          <Tag color="green">Còn trống</Tag>
        ),
    },

    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      render: (url) => (
        <img src={url} alt="room" style={{ width: 80, borderRadius: 8 }} />
      ),
    },
    {
      title: "Chức năng",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa phòng này?"
          onConfirm={() => handleDeleteRoom(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button icon={<DeleteOutlined />} danger />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20 }}>Danh sách phòng</h2>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <Input
            placeholder="Tìm kiếm phòng"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Thêm phòng
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={rooms}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: "max-content" }}
      />
      <Pagination
        current={page}
        total={total}
        pageSize={pageSize}
        onChange={handlePaginationChange}
        showSizeChanger
        pageSizeOptions={[10, 20, 50]}
        style={{ marginTop: 20, textAlign: "right" }}
      />
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <RoomForm
          onSuccess={() => {
            setIsModalOpen(false);
            fetchRooms(page, pageSize, keyword);
          }}
        />
      </Modal>
      ;
    </div>
  );
};

export default RoomAdmin;
