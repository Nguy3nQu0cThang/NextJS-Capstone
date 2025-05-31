"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Pagination,
  message,
  Popconfirm,
  Modal,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { getAllRoomsPaging, deleteRoomById } from "app/services/bookingService";
import RoomForm from "./form/RoomForm";

const RoomAdmin = () => {
  const [rooms, setRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);

  const fetchRooms = async (pageIndex, pageSize, keyword) => {
    setLoading(true);
    try {
      const roomRes = await getAllRoomsPaging(pageIndex, pageSize, keyword);
      if (roomRes.statusCode === 200) {
        setRooms(roomRes.content.data);
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
    {
      title: "Giá tiền (VND)",
      dataIndex: "giaTien",
      key: "giaTien",
      render: (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      render: (url) => (
        <img
          src={url}
          alt="room"
          style={{
            width: "80px",
            height: "80px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
      ),
    },
    {
      title: "Chức năng",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditRoom(record);
              setIsModalOpen(true);
            }}
            style={{
              backgroundColor: "#fe6b6e",
              color: "#fff",
              border: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#e55a5d")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#fe6b6e")
            }
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phòng này?"
            onConfirm={() => handleDeleteRoom(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-red-500 text-white p-4 rounded">Test Tailwind</div>
    // <div
    //   style={{
    //     padding: "20px",
    //     maxWidth: "1200px",
    //     margin: "0 auto",
    //   }}
    // >
    //   <h2
    //     style={{
    //       fontSize: "24px",
    //       fontWeight: "600",
    //       color: "#fe6b6e",
    //       marginBottom: "20px",
    //     }}
    //   >
    //     Quản lý phòng
    //   </h2>
    //   <div
    //     style={{
    //       marginBottom: "20px",
    //       display: "flex",
    //       justifyContent: "space-between",
    //       alignItems: "center",
    //     }}
    //   >
    //     <div style={{ display: "flex", gap: "12px" }}>
    //       <Input
    //         placeholder="Tìm kiếm phòng"
    //         value={keyword}
    //         onChange={(e) => setKeyword(e.target.value)}
    //         onPressEnter={handleSearch}
    //         style={{ width: "250px" }}
    //       />
    //       <Button
    //         type="primary"
    //         icon={<SearchOutlined />}
    //         onClick={handleSearch}
    //         style={{
    //           backgroundColor: "#fe6b6e",
    //           borderColor: "#fe6b6e",
    //         }}
    //         onMouseEnter={(e) =>
    //           (e.currentTarget.style.backgroundColor = "#e55a5d")
    //         }
    //         onMouseLeave={(e) =>
    //           (e.currentTarget.style.backgroundColor = "#fe6b6e")
    //         }
    //       >
    //         Tìm kiếm
    //       </Button>
    //       <Button
    //         type="primary"
    //         icon={<PlusOutlined />}
    //         onClick={() => {
    //           setEditRoom(null);
    //           setIsModalOpen(true);
    //         }}
    //         style={{
    //           backgroundColor: "#fe6b6e",
    //           borderColor: "#fe6b6e",
    //         }}
    //         onMouseEnter={(e) =>
    //           (e.currentTarget.style.backgroundColor = "#e55a5d")
    //         }
    //         onMouseLeave={(e) =>
    //           (e.currentTarget.style.backgroundColor = "#fe6b6e")
    //         }
    //       >
    //         Thêm phòng
    //       </Button>
    //     </div>
    //   </div>
    //   <Table
    //     columns={columns}
    //     dataSource={rooms}
    //     rowKey="id"
    //     loading={loading}
    //     pagination={false}
    //     scroll={{ x: "max-content" }}
    //     style={{
    //       borderRadius: "8px",
    //       boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    //     }}
    //   />
    //   <Pagination
    //     current={page}
    //     total={total}
    //     pageSize={pageSize}
    //     onChange={handlePaginationChange}
    //     showSizeChanger
    //     pageSizeOptions={[10, 20, 50]}
    //     style={{ marginTop: "20px", textAlign: "right" }}
    //   />
    //   <Modal
    //     open={isModalOpen}
    //     onCancel={() => {
    //       setIsModalOpen(false);
    //       setEditRoom(null);
    //     }}
    //     footer={null}
    //     destroyOnClose
    //     title={
    //       <span
    //         style={{ fontSize: "20px", fontWeight: "600", color: "#fe6b6e" }}
    //       >
    //         {editRoom ? "Sửa phòng" : "Thêm phòng"}
    //       </span>
    //     }
    //     style={{ maxWidth: "700px" }}
    //   >
    //     <RoomForm
    //       room={editRoom}
    //       onSuccess={() => {
    //         setIsModalOpen(false);
    //         setEditRoom(null);
    //         fetchRooms(page, pageSize, keyword);
    //       }}
    //     />
    //   </Modal>
    // </div>
  );
};

export default RoomAdmin;
