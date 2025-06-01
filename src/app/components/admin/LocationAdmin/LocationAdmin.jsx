"use client";
import { useEffect, useReducer, useState } from "react";
import { Table, Input, Button, Modal, message } from "antd";
import { getAllLocations, deleteLocation } from "app/services/locationService";
import {
  locationReducer,
  initialLocationState,
} from "app/redux/locationReducer/locationReducer";
import AddLocationModal from "./form/AddLocationModal";
import EditLocationModal from "./form/EditLocationModal";

const LocationAdmin = () => {
  const [state, dispatch] = useReducer(locationReducer, initialLocationState);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLocation, setEditingLocation] = useState(null);
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);

  const fetchLocations = async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      const locations = await getAllLocations();
      dispatch({ type: "SET_LOCATIONS", payload: locations });
    } catch (err) {
      message.error("Không thể tải vị trí.");
    } finally {
      dispatch({ type: "CLEAR_LOADING" });
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa vị trí này?",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteLocation(id);
          message.success("Xóa thành công!");
          fetchLocations();
        } catch (err) {
          message.error("Lỗi khi xóa vị trí.");
        }
      },
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Tên vị trí", dataIndex: "tenViTri", key: "tenViTri" },
    { title: "Tỉnh thành", dataIndex: "tinhThanh", key: "tinhThanh" },
    { title: "Quốc gia", dataIndex: "quocGia", key: "quocGia" },
    {
      title: "Hành động",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="link"
            onClick={() => {
              setEditingLocation(record);
              setIsEditVisible(true);
            }}
          >
            Sửa
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  const filteredData = state.locations.filter((loc) =>
    loc.tenViTri.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-white shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Tìm theo tên vị trí..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <Button type="primary" onClick={() => setIsAddVisible(true)}>
          + Thêm vị trí
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        loading={state.loading}
        pagination={{ pageSize: 5 }}
      />

      <AddLocationModal
        visible={isAddVisible}
        onSuccess={() => {
          setIsAddVisible(false);
          fetchLocations();
        }}
        onCancel={() => setIsAddVisible(false)}
      />

      <EditLocationModal
        visible={isEditVisible}
        location={editingLocation}
        onSuccess={() => {
          setIsEditVisible(false);
          fetchLocations();
        }}
        onCancel={() => setIsEditVisible(false)}
      />
    </div>
  );
};

export default LocationAdmin;
