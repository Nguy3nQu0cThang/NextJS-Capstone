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
  Tag,

} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { http } from "app/utils/setting";
import UpdateProfile from "../User/UpdateProfile";
import { deleteAccount } from "app/services/userService";
import Register from "../auth/Register";

const AdminUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal cho UpdateProfile
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false); // Modal cho Register
  const [selectedUser, setSelectedUser] = useState(null);

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

  const checkUserExists = async (userId) => {
    try {
      const response = await http.get(`/api/users/${userId}`);
      return response.data.statusCode === 200;
    } catch (error) {
      console.error(
        "Error checking user:",
        error.response?.data || error.message
      );
      return false;
    }
  };

  const handleDelete = async (userId) => {
    try {
      const userExists = await checkUserExists(userId);
      if (!userExists) {
        message.error("Người dùng không tồn tại hoặc đã bị xóa!");
        return;
      }

      await deleteAccount(userId);
      message.success("Xóa người dùng thành công!");
      fetchUsers(page, pageSize, keyword);
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response?.status === 404) {
        message.error("Người dùng không tồn tại!");
      } else if (error.response?.status === 403) {
        message.error("Bạn không có quyền xóa người dùng này!");
      } else {
        message.error("Đã có lỗi xảy ra khi xóa người dùng!");
      }
    }
  };

  const handleUpdateSuccess = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    setIsModalVisible(false);
    message.success("Cập nhật người dùng thành công!");
  };

  const handleRegisterSuccess = () => {
    setIsRegisterModalVisible(false);
    message.success("Tạo tài khoản thành công!");
    fetchUsers(page, pageSize, keyword); // Reload danh sách người dùng
  };

  const showModal = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Ngày sinh", dataIndex: "birthday", key: "birthday" },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) =>
        gender ? <Tag color="blue">Nam</Tag> : <Tag color="pink">Nữ</Tag>,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "ADMIN" ? "red" : "green"}>{role}</Tag>
      ),
    },
    {
      title: "Chức năng",
      key: "actions",
      render: (_, record) => (
        <div className="actions-container">
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            type="primary"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
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
    <div className="admin-users-table-container">
      <h2 className="admin-users-title">Danh sách người dùng</h2>
      <div className="admin-users-search-bar">
        <div className="admin-users-search-input">
          <Input
            placeholder="Tìm kiếm theo từ khóa"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button
            icon={<SearchOutlined />}
            onClick={handleSearch}
            type="primary"
          >
            Tìm kiếm
          </Button>
        </div>
        <Button
          type="primary"
          onClick={() => {
            setIsRegisterModalVisible(true); // Mở modal Register
          }}
          className="admin-users-add-button"
        >
          + Tạo tài khoản
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={false}
        scroll={{ x: "max-content" }}
        className="admin-users-table"
        locale={{ emptyText: "Không có dữ liệu" }}
      />
      <Pagination
        current={page}
        total={total}
        pageSize={pageSize}
        onChange={handlePaginationChange}
        pageSizeOptions={[10, 20, 50, 100]}
        showSizeChanger
        className="admin-users-pagination"
      />

      {isModalVisible && selectedUser && (
        <UpdateProfile
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          profile={selectedUser}
          onSuccess={handleUpdateSuccess}
          showModal={() => {}}
        />
      )}

      {isRegisterModalVisible && (
        <Modal
          title="Tạo tài khoản mới"
          open={isRegisterModalVisible}
          onCancel={() => setIsRegisterModalVisible(false)}
          footer={null}
        >
          <Register onSuccess={handleRegisterSuccess} />
        </Modal>
      )}
    </div>
  );
};

export default AdminUsersTable;
