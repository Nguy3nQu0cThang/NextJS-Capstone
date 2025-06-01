"use client";

import { useState, useEffect } from "react";
import { Table, Image, Input, Button, message, Modal } from "antd";
import { useAuth } from "app/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBed, faBath } from "@fortawesome/free-solid-svg-icons";
import AddRoomModal from "./form/AddRoomModal";
import EditRoomModal from "./form/EditRoomModal";
import { deleteRoomById, getAllRoomsDashboard } from "@/app/services/roomService";
import { getAllLocations } from "@/app/services/bookingService";

const RoomAdmin = () => {
  const { isLoggedIn, userProfile } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [allLocations, setAllLocations] = useState([]); // State để lưu tất cả vị trí
  const [selectedRoom, setSelectedRoom] = useState(null); // Phòng được chọn để xem chi tiết
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false); // State quản lý hiển thị modal chi tiết
  const [isAddModalVisible, setIsAddModalVisible] = useState(false); // State quản lý hiển thị modal thêm phòng
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // State quản lý hiển thị modal sửa phòng
  const [editingRoom, setEditingRoom] = useState(null); // Phòng đang được chỉnh sửa
  const [loading, setLoading] = useState(true); // State quản lý trạng thái tải dữ liệu
  const [searchTerm, setSearchTerm] = useState(""); // State cho thanh tìm kiếm

  // --- useEffect để fetch tất cả các vị trí một lần duy nhất khi component mount ---
  useEffect(() => {
    const fetchAllLocationsData = async () => {
      try {
        const res = await getAllLocations();
        if (res && Array.isArray(res.content)) {
          setAllLocations(res.content);
        } else {
          // Log lỗi nếu dữ liệu không đúng định dạng, nhưng không hiện message cho người dùng
          console.error("Dữ liệu vị trí không đúng định dạng hoặc rỗng:", res);
        }
      } catch (err) {
        message.error(
          "Không thể tải danh sách vị trí. Vui lòng kiểm tra kết nối hoặc quyền truy cập."
        );
        console.error("Lỗi lấy danh sách vị trí:", err);
      }
    };
    fetchAllLocationsData();
  }, []); // [] đảm bảo hook chỉ chạy một lần

  // --- Hàm dùng để fetch danh sách phòng, có thể gọi lại khi cần refresh dữ liệu ---
  const fetchRoomsData = async () => {
    // Kiểm tra quyền admin trước khi fetch
    if (!isLoggedIn || userProfile?.role !== "ADMIN") {
      message.error(
        "Bạn cần đăng nhập với vai trò admin để xem và quản lý phòng."
      );
      setLoading(false); // Đảm bảo ngừng loading
      return;
    }

    setLoading(true); // Bắt đầu tải
    try {
      // Gọi API lấy tất cả phòng
      const fetchedRooms = await getAllRoomsDashboard();
      setRooms(fetchedRooms || []); // Cập nhật state phòng
    } catch (err) {
      message.error("Không thể lấy danh sách phòng. Vui lòng thử lại.");
      console.error("Lỗi lấy danh sách phòng:", err);
    } finally {
      setLoading(false); // Kết thúc tải
    }
  };

  // --- useEffect để fetch danh sách phòng lần đầu khi component mount hoặc khi trạng thái auth thay đổi ---
  useEffect(() => {
    fetchRoomsData();
  }, [isLoggedIn, userProfile]);

  // --- useEffect để ánh xạ thông tin vị trí vào từng phòng sau khi có cả rooms và allLocations ---
  useEffect(() => {
    // Chỉ chạy khi cả rooms và allLocations đều có dữ liệu
    if (rooms.length > 0 && allLocations.length > 0) {
      const roomsWithLocationDetails = rooms.map((room) => {
        // Tìm vị trí chi tiết dựa trên maViTri của phòng
        const foundLocation = allLocations.find(
          (loc) => loc.id === room.maViTri
        );
        return {
          ...room,
          viTriDetail: foundLocation || null, // Gán object vị trí hoặc null nếu không tìm thấy
        };
      });
      setRooms(roomsWithLocationDetails); // Cập nhật state rooms với thông tin vị trí chi tiết
    }
    // Dependency array: hook chạy lại khi số lượng rooms hoặc allLocations thay đổi
  }, [rooms.length, allLocations.length]);

  // --- Hàm lọc phòng theo từ khóa tìm kiếm ---
  const filteredRooms = rooms.filter((room) =>
    room.tenPhong.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Hàm rút gọn mô tả cho cột hiển thị ---
  const truncateDescription = (text) => {
    if (text && text.length > 50) return text.substring(0, 50) + "...";
    return text || "";
  };

  // --- Cấu hình các cột cho bảng Ant Design ---
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 50 },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "image",
      render: (text) => (
        <Image
          src={text}
          alt="phòng"
          width={100}
          fallback="https://via.placeholder.com/100?text=Image+Not+Found" // Hình ảnh dự phòng
        />
      ),
      width: 120,
    },
    { title: "Tên phòng", dataIndex: "tenPhong", key: "tenPhong", width: 150 },
    {
      title: "Vị trí",
      dataIndex: "viTriDetail", // Sử dụng thuộc tính đã được ánh xạ
      key: "viTri",
      render: (viTriDetail) => {
        if (viTriDetail) {
          const parts = [];
          if (viTriDetail.tenViTri) parts.push(viTriDetail.tenViTri);
          if (viTriDetail.tinhThanh) parts.push(viTriDetail.tinhThanh);
          if (viTriDetail.quocGia) parts.push(viTriDetail.quocGia);
          return parts.join(", ") || "N/A"; // Nối các phần lại bằng dấu phẩy
        }
        return "N/A"; // Hiển thị N/A nếu không có chi tiết vị trí
      },
      width: 150,
    },
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
            <span className="font-medium">{record.phongNgu}</span> phòng ngủ
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
            onClick={(e) => handleEdit(e, record)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Sửa
          </Button>
          <Button
            danger
            onClick={(e) => handleDelete(e, record)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Xóa
          </Button>
        </div>
      ),
      width: 150,
    },
  ];

  // --- Các hàm xử lý sự kiện Modal ---
  const showDetailModal = (record) => {
    setSelectedRoom(record);
    setIsDetailModalVisible(true);
  };

  const handleAdd = () => {
    setIsAddModalVisible(true);
  };

  const handleEdit = (e, record) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra hàng của bảng
    setEditingRoom(record);
    setIsEditModalVisible(true);
  };

  // --- Hàm xử lý xóa phòng ---
  const handleDelete = async (e, record) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra hàng của bảng
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa phòng "${record.tenPhong}" không?`,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // Gọi API xóa phòng bằng ID
          await deleteRoomById(record.id);
          message.success(`Đã xóa phòng "${record.tenPhong}" thành công!`);
          // Sau khi xóa thành công, gọi lại hàm fetchRoomsData để cập nhật danh sách phòng mới nhất từ server
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

  // --- Xử lý khi thêm phòng thành công ---
  const handleAddSuccess = () => {
    fetchRoomsData(); // Tải lại dữ liệu sau khi thêm
    handleCancel(); // Đóng modal
  };

  // --- Xử lý khi sửa phòng thành công ---
  const handleEditSuccess = () => {
    fetchRoomsData(); // Tải lại dữ liệu sau khi sửa
    handleCancel(); // Đóng modal
  };

  // --- Hàm đóng tất cả các modal ---
  const handleCancel = () => {
    setIsDetailModalVisible(false);
    setIsAddModalVisible(false);
    setIsEditModalVisible(false);
    setSelectedRoom(null);
    setEditingRoom(null);
  };

  // --- Render giao diện ---
  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Quản lý phòng</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm kiếm theo tên phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 rounded-md border-gray-300"
            prefix={<span className="text-gray-400">🔍</span>}
          />
          <Button
            type="primary"
            className="bg-green-500 hover:bg-green-600 text-white rounded-md"
            onClick={handleAdd}
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
          // Khi click vào hàng, hiển thị modal chi tiết
          onClick: () => showDetailModal(record),
        })}
        pagination={{ pageSize: 5 }} // Phân trang với 5 mục mỗi trang
        loading={loading} // Hiển thị trạng thái loading
        className="bg-white shadow-md rounded-md"
      />

      {/* Modal hiển thị chi tiết phòng */}
      <Modal
        title={selectedRoom?.tenPhong}
        open={isDetailModalVisible}
        onCancel={handleCancel}
        footer={null} // Không có footer buttons
        width={600}
        className="rounded-lg"
      >
        {selectedRoom && (
          <div>
            <Image
              src={selectedRoom.hinhAnh}
              alt="phòng"
              className="w-full h-64 object-cover rounded-t-lg"
              fallback="https://via.placeholder.com/600x400?text=Image+Not+Found"
            />
            <div className="p-4">
              <p className="text-gray-700 mb-4">{selectedRoom.moTa}</p>
              <div className="grid grid-cols-2 gap-2">
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
            </div>
          </div>
        )}
      </Modal>

      {/* Modal thêm phòng */}
      <AddRoomModal
        visible={isAddModalVisible}
        onCancel={handleCancel}
        onSuccess={handleAddSuccess}
      />

      {/* Modal sửa phòng */}
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
