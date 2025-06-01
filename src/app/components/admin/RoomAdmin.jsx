"use client";

import { useState, useEffect } from "react";
import { Table, Image, Input, Button, message, Modal } from "antd";
import { useAuth } from "app/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBed,
  faBath,
  faWifi,
  faTv,
  faKitchenSet,
  faCar,
  faUtensils,
  faFan,
  faFire,
  faWaterLadder,
  faSnowflake,
} from "@fortawesome/free-solid-svg-icons";

import {
  deleteRoomById,
  getAllRoomsDashboard,
} from "@/app/services/roomService";
import { getAllLocations } from "@/app/services/bookingService";

import AddRoomModal from "./form/AddRoomModal";
import EditRoomModal from "./form/EditRoomModal";

const RoomAdmin = () => {
  const { isLoggedIn, userProfile } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Effect để kiểm tra kích thước màn hình
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch tất cả các vị trí một lần duy nhất
  useEffect(() => {
    const fetchAllLocationsData = async () => {
      try {
        const res = await getAllLocations();
        if (res?.content && Array.isArray(res.content)) {
          setAllLocations(res.content);
        } else {
          console.error("Location data is not in expected format:", res);
        }
      } catch (err) {
        message.error(
          "Failed to load locations. Please check connection or permissions."
        );
        console.error("Error fetching locations:", err);
      }
    };
    fetchAllLocationsData();
  }, []);

  // Hàm để fetch danh sách phòng, có thể dùng lại khi cần refresh
  const fetchRoomsData = async () => {
    if (!isLoggedIn || userProfile?.role !== "ADMIN") {
      message.error("You need to be logged in as an admin to manage rooms.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const fetchedRooms = await getAllRoomsDashboard();
      setRooms(fetchedRooms || []);
    } catch (err) {
      message.error("Failed to fetch room list. Please try again.");
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  // Effect để fetch danh sách phòng lần đầu
  useEffect(() => {
    fetchRoomsData();
  }, [isLoggedIn, userProfile]);

  // Ánh xạ thông tin vị trí vào từng phòng
  useEffect(() => {
    if (rooms.length > 0 && allLocations.length > 0) {
      const roomsWithLocationDetails = rooms.map((room) => {
        const foundLocation = allLocations.find(
          (loc) => loc.id === room.maViTri
        );
        return {
          ...room,
          viTriDetail: foundLocation || null,
        };
      });
      setRooms(roomsWithLocationDetails);
    }
  }, [rooms.length, allLocations.length]);

  const filteredRooms = rooms.filter((room) =>
    room.tenPhong.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateDescription = (text) => {
    if (text && text.length > 50) return text.substring(0, 50) + "...";
    return text || "";
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", responsive: ["md"], width: 50 },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "image",
      render: (text) => (
        <Image
          src={text}
          alt="phòng"
          className="w-20 h-auto object-cover rounded-md"
          fallback="https://via.placeholder.com/100?text=Image+Not+Found"
        />
      ),
      width: 120,
    },
    { title: "Tên phòng", dataIndex: "tenPhong", key: "tenPhong", width: 150 },
    {
      title: "Vị trí",
      dataIndex: "viTriDetail",
      key: "viTri",
      render: (viTriDetail) => {
        if (viTriDetail) {
          const parts = [];
          if (viTriDetail.tenViTri) parts.push(viTriDetail.tenViTri);
          if (viTriDetail.tinhThanh) parts.push(viTriDetail.tinhThanh);
          if (viTriDetail.quocGia) parts.push(viTriDetail.quocGia);
          return parts.join(", ") || "N/A";
        }
        return "N/A";
      },
      width: 150,
      responsive: ["md"],
    },
    {
      title: "Chi tiết",
      key: "details",
      render: (_, record) => (
        <div className="flex flex-col gap-1 text-xs sm:text-sm">
          <div>
            {/* Icon trong bảng: Sử dụng style cho màu và margin */}
            <FontAwesomeIcon
              icon={faUser}
              style={{ color: "#3b82f6", marginRight: "0.5rem" }}
            />
            <span className="font-medium">{record.khach}</span> khách
          </div>
          <div>
            {/* Icon trong bảng: Sử dụng style cho màu và margin */}
            <FontAwesomeIcon
              icon={faBed}
              style={{ color: "#3b82f6", marginRight: "0.5rem" }}
            />
            <span className="font-medium">{record.phongNgu}</span>{" "}
            {isSmallScreen ? "PN" : "Phòng ngủ"}
          </div>
          <div>
            {/* Icon trong bảng: Sử dụng style cho màu và margin */}
            <FontAwesomeIcon
              icon={faBed}
              style={{ color: "#3b82f6", marginRight: "0.5rem" }}
            />
            <span className="font-medium">{record.giuong}</span> giường
          </div>
          <div>
            {/* Icon trong bảng: Sử dụng style cho màu và margin */}
            <FontAwesomeIcon
              icon={faBath}
              style={{ color: "#3b82f6", marginRight: "0.5rem" }}
            />
            <span className="font-medium">{record.phongTam}</span>{" "}
            {isSmallScreen ? "PT" : "Phòng tắm"}
          </div>
        </div>
      ),
      width: 150,
      responsive: ["sm"],
    },
    {
      title: "Giá",
      dataIndex: "giaTien",
      key: "giaTien",
      render: (text) => `${text} $ / đêm`,
      width: 120,
      responsive: ["sm"],
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      key: "moTa",
      render: (text) => truncateDescription(text),
      width: 200,
      responsive: ["lg"],
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            onClick={(e) => handleEdit(e, record)}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1"
            style={{ marginRight: "5px" }}
          >
            Sửa
          </Button>
          <Button
            danger
            onClick={(e) => handleDelete(e, record)}
            className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1"
          >
            Xóa
          </Button>
        </div>
      ),
      width: 150,
    },
  ];

  const showDetailModal = (record) => {
    setSelectedRoom(record);
    setIsDetailModalVisible(true);
  };

  const handleAdd = () => {
    setIsAddModalVisible(true);
  };

  const handleEdit = (e, record) => {
    e.stopPropagation();
    setEditingRoom(record);
    setIsEditModalVisible(true);
  };

  const handleDelete = async (e, record) => {
    e.stopPropagation();
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa phòng "${record.tenPhong}" không?`,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteRoomById(record.id);
          message.success(`Đã xóa phòng "${record.tenPhong}" thành công!`);
          fetchRoomsData();
        } catch (error) {
          message.error("Xóa phòng thất bại. Vui lòng thử lại.");
          console.error(
            "Lỗi xóa phòng:",
            error.response?.data || error.message
          );
        }
      },
      onCancel() {
        message.info("Đã hủy thao tác xóa.");
      },
    });
  };

  const handleAddSuccess = () => {
    fetchRoomsData();
    handleCancel();
  };

  const handleEditSuccess = () => {
    fetchRoomsData();
    handleCancel();
  };

  const handleCancel = () => {
    setIsDetailModalVisible(false);
    setIsAddModalVisible(false);
    setIsEditModalVisible(false);
    setSelectedRoom(null);
    setEditingRoom(null);
  };

  // Định nghĩa danh sách tiện nghi và icon tương ứng
  const amenitiesList = [
    { key: "bep", label: "Bếp", icon: faKitchenSet },
    { key: "mayGiat", label: "Máy giặt", icon: faFan },
    { key: "banLa", label: "Bàn là", icon: faFire },
    { key: "tivi", label: "Tivi", icon: faTv },
    { key: "dieuHoa", label: "Điều hòa", icon: faSnowflake },
    { key: "wifi", label: "Wifi", icon: faWifi },
    { key: "doXe", label: "Đỗ xe", icon: faCar },
    { key: "hoBoi", label: "Hồ bơi", icon: faWaterLadder },
    { key: "banUi", label: "Bàn ủi", icon: faFire },
    { key: "bepNuong", label: "Bếp nướng", icon: faUtensils },
    { key: "bonTam", label: "Bồn tắm", icon: faBath },
  ];

  return (
    <div className="p-2 sm:p-4 bg-gray-100 min-h-screen">
      <div className="admin-users-table-container">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Quản lý phòng
        </h2>
        <div className="admin-users-search-bar">
          <div className="admin-user-input">
            <Input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<span className="text-gray-400">🔍</span>}
            />
          </div>
          <Button
            type="primary"
            className="bg-green-500 hover:bg-green-600 text-white rounded-md flex-shrink-0"
            onClick={handleAdd}
          >
            + Thêm phòng
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          rowKey="id"
          dataSource={filteredRooms}
          columns={columns}
          onRow={(record) => ({
            onClick: () => showDetailModal(record),
          })}
          pagination={{ pageSize: 5 }}
          loading={loading}
          className="bg-white shadow-md rounded-md"
          scroll={{ x: "max-content" }}
        />
      </div>

      <Modal
        title={selectedRoom?.tenPhong}
        open={isDetailModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={window.innerWidth < 768 ? "90%" : 600}
        className="rounded-lg"
      >
        {selectedRoom && (
          <div>
            <Image
              src={selectedRoom.hinhAnh}
              alt="room"
              className="w-full h-48 sm:h-64 object-cover rounded-t-lg"
              fallback="https://via.placeholder.com/600x400?text=Image+Not+Found"
            />
            <div className="p-3 sm:p-4">
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                {selectedRoom.moTa}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm sm:text-base mb-4">
                <div>
                  <span className="font-semibold">Khách:</span>{" "}
                  {selectedRoom.khach}
                </div>
                <div>
                  <span className="font-semibold">Phòng ngủ:</span>{" "}
                  {selectedRoom.phongNgu}
                </div>
                <div>
                  <span className="font-semibold">Giường:</span>{" "}
                  {selectedRoom.giuong}
                </div>
                <div>
                  <span className="font-semibold">Phòng tắm:</span>{" "}
                  {selectedRoom.phongTam}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Giá:</span> $
                  {selectedRoom.giaTien} / đêm
                </div>
              </div>

              {/* Phần hiển thị Amenities */}
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                Tiện nghi
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm sm:text-base">
                {amenitiesList.map((amenity) => {
                  if (selectedRoom[amenity.key]) {
                    return (
                      <div key={amenity.key} className="flex items-center">
                        {/* Icon trong popup chi tiết: Sử dụng style cho màu và margin */}
                        <FontAwesomeIcon
                          icon={amenity.icon}
                          style={{ color: "#3b82f6", marginRight: "0.5rem" }}
                        />
                        <span>{amenity.label}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <AddRoomModal
        visible={isAddModalVisible}
        onCancel={handleCancel}
        onSuccess={handleAddSuccess}
      />

      <EditRoomModal
        visible={isEditModalVisible}
        onCancel={handleCancel}
        onSuccess={handleEditSuccess}
        room={editingRoom}
      />
    </div>
  );
};

export default RoomAdmin;
