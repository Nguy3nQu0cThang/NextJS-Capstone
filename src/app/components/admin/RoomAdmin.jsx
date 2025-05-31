"use client";

import { useState, useEffect } from "react";
import { Table, Image, Input, Button, message, Modal } from "antd";
import { http } from "app/utils/setting";
import { useAuth } from "app/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBed,
  faBath,
  faWifi,
  faTshirt,
  faUtensils,
  faTv,
  faFan,
  faCar,
  faSwimmer,
  faBurn,
} from "@fortawesome/free-solid-svg-icons";

const RoomAdmin = () => {
  const { isLoggedIn, userProfile } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      if (!isLoggedIn || userProfile?.role !== "ADMIN") {
        message.error(
          "Bạn cần đăng nhập với vai trò admin để xem danh sách phòng."
        );
        return;
      }

      setLoading(true);
      try {
        const res = await http.get("/api/phong-thue");
        setRooms(res.data.content || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách phòng:", err);
        message.error("Không thể lấy danh sách phòng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [isLoggedIn, userProfile]);

  const filteredRooms = rooms.filter((room) =>
    room.tenPhong.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateDescription = (text) => {
    if (text.length > 50) return text.substring(0, 50) + "...";
    return text;
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 50 },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "image",
      render: (text) => <Image src={text} alt="phòng" width={100} />,
      width: 120,
    },
    { title: "Tên phòng", dataIndex: "tenPhong", key: "tenPhong", width: 150 },
    {
      title: "Chi tiết",
      key: "details",
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <div>
            <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" />
            <span className="font-medium">{record.khach}</span> khách
          </div>
          <div>
            <FontAwesomeIcon icon={faBed} className="text-blue-500 mr-2" />
            <span className="font-medium">{record.giuong}</span> giường
          </div>
          <div>
            <FontAwesomeIcon icon={faBath} className="text-blue-500 mr-2" />
            <span className="font-medium">{record.phongTam}</span> phòng tắm
          </div>
        </div>
      ),
      width: 150,
    },
    {
      title: "Giá",
      dataIndex: "giaTien",
      key: "giaTien",
      render: (text) => `${text} $ / đêm`,
      width: 120,
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      key: "moTa",
      render: (text) => truncateDescription(text),
      width: 200,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            onClick={() => alert(`Sửa phòng ${record.id}`)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Sửa
          </Button>
          <Button
            danger
            onClick={() => alert(`Xóa phòng ${record.id}`)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Xóa
          </Button>
        </div>
      ),
      width: 150,
    },
  ];

  const showModal = (record) => {
    setSelectedRoom(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRoom(null);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Quản lý phòng</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 rounded-md border-gray-300"
            prefix={<span className="text-gray-400">🔍</span>}
          />
          <Button
            type="primary"
            className="bg-red-500 hover:bg-red-600 text-white rounded-md"
            onClick={() => alert("Thêm phòng mới")}
          >
            Thêm phòng
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        dataSource={filteredRooms}
        columns={columns}
        onRow={(record) => ({
          onClick: () => showModal(record),
        })}
        pagination={{ pageSize: 5 }}
        loading={loading}
        className="bg-white shadow-md rounded-md"
      />

      <Modal
        title={selectedRoom?.tenPhong}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        className="rounded-lg"
      >
        {selectedRoom && (
          <div>
            <Image
              src={selectedRoom.hinhAnh}
              alt="phòng"
              className="w-full h-64 object-cover rounded-t-lg"
            />
            <div className="p-4">
              <p className="text-gray-700 mb-4">{selectedRoom.moTa}</p>
              <span className="font-bold">Tiện ích:</span>
              <div className="grid grid-cols-2 gap-2 mt-4">
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
              <div className="mt-4">
                <span className="font-semibold">Tiện ích:</span>
                <ul className="grid grid-cols-2 gap-2 ml-5">
                  {selectedRoom.wifi && (
                    <li>
                      <FontAwesomeIcon
                        icon={faWifi}
                        className="text-blue-500 mr-2"
                      />
                      Wi-Fi
                    </li>
                  )}
                  {selectedRoom.mayGiat && (
                    <li>
                      <FontAwesomeIcon
                        icon={faTshirt}
                        className="text-blue-500 mr-2"
                      />
                      Máy giặt
                    </li>
                  )}
                  {selectedRoom.bep && (
                    <li>
                      <FontAwesomeIcon
                        icon={faUtensils}
                        className="text-blue-500 mr-2"
                      />
                      Bếp
                    </li>
                  )}
                  {selectedRoom.tivi && (
                    <li>
                      <FontAwesomeIcon
                        icon={faTv}
                        className="text-blue-500 mr-2"
                      />
                      TV
                    </li>
                  )}
                  {selectedRoom.dieuHoa && (
                    <li>
                      <FontAwesomeIcon
                        icon={faFan}
                        className="text-blue-500 mr-2"
                      />
                      Điều hòa
                    </li>
                  )}
                  {selectedRoom.doXe && (
                    <li>
                      <FontAwesomeIcon
                        icon={faCar}
                        className="text-blue-500 mr-2"
                      />
                      Đỗ xe
                    </li>
                  )}
                  {selectedRoom.hoBoi && (
                    <li>
                      <FontAwesomeIcon
                        icon={faSwimmer}
                        className="text-blue-500 mr-2"
                      />
                      Hồ bơi
                    </li>
                  )}
                  {selectedRoom.banLa && (
                    <li>
                      <FontAwesomeIcon
                        icon={faBurn}
                        className="text-blue-500 mr-2"
                      />
                      Bàn là
                    </li>
                  )}
                  {selectedRoom.banUi && (
                    <li>
                      <FontAwesomeIcon
                        icon={faBurn}
                        className="text-blue-500 mr-2"
                      />
                      Bàn ủi
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoomAdmin;
