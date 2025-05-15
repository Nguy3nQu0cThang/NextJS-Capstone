"use client";

import React, { useState, useEffect } from "react";
import { Table, Input, Button, Pagination, message, Popconfirm } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { http } from "app/utils/setting";

const AdminUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (pageIndex, pageSize, keyword) => {
    setLoading(true);
    try {
      const response = await http.get(
        `/api/users/phan-trang-tim-kiem?pageIndex=${pageIndex}&pageSize=${pageSize}&keyword=${keyword}`
      );
      if (response.data.statusCode === 200) {
        setUsers(response.data.content?.data || []);
        setTotal(response.data.content?.totalRow || 0);
      } else {
        message.error("Không thể tải danh sách người dùng!");
        console.error("Failed to fetch users:", response.data);
      }
    } catch (error) {
      message.error("Đã có lỗi xảy ra khi tải dữ liệu!");
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, pageSize, keyword);
  }, [page, pageSize, keyword]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, pageSize, keyword);
  };

  const handlePaginationChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
    fetchUsers(newPage, newPageSize, keyword);
  };

  const handleDelete = async (userId) => {
    try {
      const response = await http.delete(`/api/users/${userId}`);
      if (response.data.statusCode === 200) {
        message.success("Xóa người dùng thành công!");
        fetchUsers(page, pageSize, keyword); // Reload danh sách
      } else {
        message.error("Xóa người dùng thất bại!");
        console.error("Failed to delete user:", response.data);
      }
    } catch (error) {
      message.error("Đã có lỗi xảy ra khi xóa người dùng!");
      console.error(
        "Error deleting user:",
        error.response?.data || error.message
      );
    }
  };

  const handleUpdate = (user) => {
    // Placeholder cho chức năng cập nhật
    message.info(
      `Chức năng cập nhật người dùng ID: ${user.id} đang được phát triển!`
    );
    console.log("User to update:", user);
    // Ở đây bạn có thể mở modal hoặc chuyển hướng để chỉnh sửa thông tin người dùng
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Ngày sinh", dataIndex: "birthday", key: "birthday" },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (text) => (text ? "Nam" : "Nữ"),
    },
    { title: "Vai trò", dataIndex: "role", key: "role" },
    {
      title: "Chức năng",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            type="primary"
          ></Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} danger></Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>Danh sách người dùng</h2>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <Input
          placeholder="Tìm kiếm theo từ khóa"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 250 }}
        />
        <Button icon={<SearchOutlined />} onClick={handleSearch} type="primary">
          Tìm kiếm
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={false}
        scroll={{ x: "max-content" }}
      />
      <Pagination
        current={page}
        total={total}
        pageSize={pageSize}
        onChange={handlePaginationChange}
        pageSizeOptions={[10, 20, 50, 100]}
        showSizeChanger
        style={{ marginTop: "20px", textAlign: "right" }}
      />
    </div>
  );
};

export default AdminUsersTable;
