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

import EditRoomModal from "./form/EditRoomModal";
import AddRoomModal from "./form/AddRoomModal";

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

  // Responsive check
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch location + room data
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn || userProfile?.role !== "ADMIN") {
        message.error("Bạn cần đăng nhập với quyền ADMIN để quản lý phòng.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [roomRes, locationRes] = await Promise.all([
          getAllRoomsDashboard(),
          getAllLocations(),
        ]);

        const locationList = Array.isArray(locationRes.content)
          ? locationRes.content
          : [];

        setAllLocations(locationList);

        const roomsWithLocation = roomRes.map((room) => {
          const loc = locationList.find((l) => l.id === room.maViTri);
          return {
            ...room,
            viTriDetail: loc || null,
          };
        });

        setRooms(roomsWithLocation);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải dữ liệu phòng hoặc vị trí.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, userProfile]);

  const handleAdd = () => setIsAddModalVisible(true);
  const handleEdit = (e, record) => {
    e.stopPropagation();
    setEditingRoom(record);
    setIsEditModalVisible(true);
  };

  const handleDelete = (e, record) => {
    e.stopPropagation();
    Modal.confirm({
      title: `Xóa phòng "${record.tenPhong}"?`,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteRoomById(record.id);
          message.success(`Đã xóa phòng "${record.tenPhong}" thành công!`);
          // Reload room list
          const roomRes = await getAllRoomsDashboard();
          const updatedRooms = roomRes.map((room) => {
            const loc = allLocations.find((l) => l.id === room.maViTri);
            return { ...room, viTriDetail: loc || null };
          });
          setRooms(updatedRooms);
        } catch (err) {
          message.error("Xóa phòng thất bại.");
        }
      },
      onCancel() {
        message.info("Đã hủy xóa.");
      },
    });
  };

  const handleCancel = () => {
    setIsDetailModalVisible(false);
    setIsAddModalVisible(false);
    setIsEditModalVisible(false);
    setSelectedRoom(null);
    setEditingRoom(null);
  };

  const handleAddSuccess = () => {
    handleCancel();
    message.success("Thêm phòng thành công!");
    fetchLatestRooms();
  };

  const handleEditSuccess = () => {
    handleCancel();
    message.success("Cập nhật phòng thành công!");
    fetchLatestRooms();
  };

  const fetchLatestRooms = async () => {
    try {
      const roomRes = await getAllRoomsDashboard();
      const updatedRooms = roomRes.map((room) => {
        const loc = allLocations.find((l) => l.id === room.maViTri);
        return { ...room, viTriDetail: loc || null };
      });
      setRooms(updatedRooms);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.tenPhong.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateDescription = (text) =>
    text?.length > 50 ? text.substring(0, 50) + "..." : text || "";

  const showDetailModal = (record) => {
    setSelectedRoom(record);
    setIsDetailModalVisible(true);
  };

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
          onClick={(e) => e.stopPropagation()}
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
        const parts = [
          viTriDetail?.tenViTri,
          viTriDetail?.tinhThanh,
          viTriDetail?.quocGia,
        ].filter(Boolean);
        return parts.join(", ") || "N/A";
      },
      responsive: ["md"],
      width: 150,
    },
    {
      title: "Chi tiết",
      key: "details",
      render: (_, record) => (
        <div className="flex flex-col gap-1 text-xs sm:text-sm">
          <div>
            <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
            {record.khach} khách
          </div>
          <div>
            <FontAwesomeIcon icon={faBed} className="mr-2 text-blue-500" />
            {record.phongNgu} {isSmallScreen ? "PN" : "Phòng ngủ"}
          </div>
          <div>
            <FontAwesomeIcon icon={faBed} className="mr-2 text-blue-500" />
            {record.giuong} giường
          </div>
          <div>
            <FontAwesomeIcon icon={faBath} className="mr-2 text-blue-500" />
            {record.phongTam} {isSmallScreen ? "PT" : "Phòng tắm"}
          </div>
        </div>
      ),
      responsive: ["sm"],
      width: 150,
    },
    {
      title: "Giá",
      dataIndex: "giaTien",
      key: "giaTien",
      render: (text) => `${text} $ / đêm`,
      responsive: ["sm"],
      width: 120,
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      key: "moTa",
      render: truncateDescription,
      responsive: ["lg"],
      width: 200,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
            onClick={(e) => handleEdit(e, record)}
          >
            Sửa
          </Button>
          <Button
            danger
            className="bg-red-500 hover:bg-red-600 text-white text-xs"
            onClick={(e) => handleDelete(e, record)}
          >
            Xóa
          </Button>
        </div>
      ),
      width: 150,
    },
  ];

  return (
    <div className="p-2 sm:p-4 bg-gray-100 min-h-screen">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Quản lý phòng
      </h2>
      <div className="flex gap-2 mb-4 flex-col sm:flex-row items-start sm:items-center">
        <Input
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<span className="text-gray-400">🔍</span>}
        />
        <Button
          type="primary"
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={handleAdd}
        >
          + Thêm phòng
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={filteredRooms}
        columns={columns}
        pagination={{ pageSize: 5 }}
        loading={loading}
        onRow={(record) => ({
          onClick: () => showDetailModal(record),
        })}
        className="bg-white shadow-md rounded-md"
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={selectedRoom?.tenPhong}
        open={isDetailModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={isSmallScreen ? "90%" : 600}
      >
        {selectedRoom && (
          <>
            <Image
              src={selectedRoom.hinhAnh}
              alt="room"
              className="w-full h-48 sm:h-64 object-cover"
              fallback="https://via.placeholder.com/600x400?text=Image+Not+Found"
            />
            <div className="p-4">
              <p className="mb-3 text-gray-700">{selectedRoom.moTa}</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <strong>Khách:</strong> {selectedRoom.khach}
                </div>
                <div>
                  <strong>Phòng ngủ:</strong> {selectedRoom.phongNgu}
                </div>
                <div>
                  <strong>Giường:</strong> {selectedRoom.giuong}
                </div>
                <div>
                  <strong>Phòng tắm:</strong> {selectedRoom.phongTam}
                </div>
                <div className="col-span-2">
                  <strong>Giá:</strong> ${selectedRoom.giaTien} / đêm
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Tiện nghi</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amenitiesList.map(({ key, label, icon }) =>
                  selectedRoom[key] ? (
                    <div key={key} className="flex items-center">
                      <FontAwesomeIcon
                        icon={icon}
                        className="mr-2 text-blue-500"
                      />
                      {label}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </>
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
