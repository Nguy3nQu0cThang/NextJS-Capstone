"use client";

import { useState, useEffect, useCallback } from "react";
import { message, Modal, Tag } from "antd";
import { useAuth } from "@/app/context/AuthContext";

import pLimit from "p-limit";
import BookingRoomList from "./BookingRoomList";
import BookingRoomDetail from "./BookingRoomDetail";
import BookingAdminForm from "./form/BookingAdminForm";
import { getAllUsersPaging } from "@/app/services/userService";
import { getAllBookings } from "@/app/services/bookingService";
import {
  deleteBookingById,
  getAllRoomsPaging,
} from "@/app/services/roomService";
import AddBookingAdmin from "./form/AddBookingAdmin";

const BookingAdmin = () => {
  const { isLoggedIn, userProfile } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [currentRoomPage, setCurrentRoomPage] = useState(1);
  const [roomPageSize, setRoomPageSize] = useState(10);
  const [totalRooms, setTotalRooms] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomBookings, setRoomBookings] = useState([]);
  const [allBookingsLoaded, setAllBookingsLoaded] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [currentBookingPage, setCurrentBookingPage] = useState(1);
  const [bookingPageSize, setBookingPageSize] = useState(10);
  const [totalBookingItems, setTotalBookingItems] = useState(0);
  const [isAddBookingModalVisible, setIsAddBookingModalVisible] =
    useState(false);

  useEffect(() => {
    console.log("useEffect: Checking screen size.");
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const getStatusTag = useCallback((status) => {
    switch (status) {
      case "Chờ xác nhận":
        return <Tag color="orange">{status}</Tag>;
      case "Đã xác nhận":
        return <Tag color="green">{status}</Tag>;
      case "Đã hủy":
        return <Tag color="red">{status}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  }, []);

  const fetchAllUsersAndCreateMap = useCallback(async () => {
    console.log("Fetching all users and creating map...");
    const fetchedUsersMap = {};
    let hasMore = true;
    let pageIndex = 1;
    const tempPageSize = 50;
    const limit = pLimit(5); 

    while (hasMore) {
      try {
        const userData = await limit(() =>
          getAllUsersPaging(pageIndex, tempPageSize)
        );
        console.log(`getAllUsersPaging page ${pageIndex} data:`, userData);

        if (
          userData &&
          userData.content &&
          Array.isArray(userData.content.data)
        ) {
          const usersContent = userData.content.data;
          usersContent.forEach((user) => {
            if (user?.id) {
              fetchedUsersMap[String(user.id)] = user;
            }
          });

          if (
            usersContent.length < tempPageSize ||
            pageIndex * tempPageSize >= userData.content.totalRow
          ) {
            hasMore = false;
          } else {
            pageIndex++;
          }
        } else {
          console.warn(
            "API response for users is not as expected or empty content:",
            userData
          );
          hasMore = false;
        }
      } catch (error) {
        message.error("Không thể tải thông tin người dùng.");
        console.error("Error fetching users:", error);
        hasMore = false;
      }
    }
    console.log("Finished fetching users. Users Map:", fetchedUsersMap);
    setUsersMap(fetchedUsersMap);
    return fetchedUsersMap;
  }, []);

  const fetchAllBookings = useCallback(async () => {
    console.log("Fetching all bookings...");
    try {
      const bookingsResponse = await getAllBookings();
      console.log("getAllBookings response:", bookingsResponse);
      if (bookingsResponse && bookingsResponse.content) {
        setAllBookingsLoaded(bookingsResponse.content);
      } else {
        console.warn(
          "API response for bookings is not as expected:",
          bookingsResponse
        );
        setAllBookingsLoaded([]);
      }
    } catch (err) {
      message.error("Tải tất cả đặt phòng thất bại.");
      console.error("Error fetching all bookings:", err);
      setAllBookingsLoaded([]);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      console.log(
        "useEffect: Loading initial data (users and all bookings)..."
      );
      setInitialLoading(true);
      try {
        await Promise.all([fetchAllUsersAndCreateMap(), fetchAllBookings()]);
        console.log("Initial data loaded successfully.");
      } catch (error) {
        message.error("Không thể tải dữ liệu ban đầu.");
        console.error("Error during initial data loading:", error);
      } finally {
        setInitialLoading(false);
        console.log("Initial loading set to false.");
      }
    };
    loadInitialData();
  }, [fetchAllUsersAndCreateMap, fetchAllBookings]);

  const fetchRooms = useCallback(async () => {
    console.log("Fetching rooms...");
    if (!isLoggedIn || userProfile?.role !== "ADMIN") {
      message.error("Bạn cần đăng nhập với quyền admin.");
      setLoading(false);
      console.log("Not logged in as admin, skipping room fetch.");
      return;
    }
    setLoading(true);
    try {
      const data = await getAllRoomsPaging(
        currentRoomPage,
        roomPageSize,
        roomSearchTerm
      );
      console.log("getAllRoomsPaging response:", data);
      if (data?.content?.data) {
        setRooms(data.content.data);
        setTotalRooms(data.content.totalRow || 0);
      } else {
        setRooms([]);
        setTotalRooms(0);
        console.warn(
          "API response for rooms is not as expected or empty data:",
          data
        );
      }
    } catch (err) {
      message.error("Tải danh sách phòng thất bại.");
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
      console.log("Room fetch loading set to false.");
    }
  }, [isLoggedIn, userProfile, currentRoomPage, roomPageSize, roomSearchTerm]);

  useEffect(() => {
    console.log("useEffect: selectedRoom or initialLoading changed.");
    console.log("   selectedRoom:", selectedRoom);
    console.log("   initialLoading:", initialLoading);
    if (!selectedRoom && !initialLoading) {
      fetchRooms();
    } else if (initialLoading) {
    } else {
    }
  }, [fetchRooms, selectedRoom, initialLoading]);

  const filterBookingsForSelectedRoom = useCallback(() => {
    console.log("Filtering bookings for selected room...");
    console.log("   selectedRoom:", selectedRoom);
    console.log("   allBookingsLoaded (count):", allBookingsLoaded.length);
    console.log("   usersMap (keys count):", Object.keys(usersMap).length);

    if (
      !selectedRoom ||
      !allBookingsLoaded.length ||
      Object.keys(usersMap).length === 0
    ) {
      console.log(
        "   Pre-conditions not met for filtering bookings. Setting empty."
      );
      setRoomBookings([]);
      setTotalBookingItems(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const bookingsForThisRoom = allBookingsLoaded.filter(
        (booking) => booking.maPhong === selectedRoom.id
      );
      console.log(
        "   Bookings filtered for this room (count):",
        bookingsForThisRoom.length
      );
      console.log("   Bookings for this room data:", bookingsForThisRoom);

      const bookingsWithUserDetails = bookingsForThisRoom.map((booking) => {
        const userDetails = usersMap[String(booking.maNguoiDung)] || null;
        const status =
          booking.trangThai ||
          (booking.ngayDen && new Date(booking.ngayDen) > new Date()
            ? "Chờ xác nhận"
            : "Đã xác nhận");

        return {
          ...booking,
          userDetails,
          trangThai: status,
        };
      });
      console.log("   Bookings with user details:", bookingsWithUserDetails);

      setTotalBookingItems(bookingsWithUserDetails.length);
      const startIndex = (currentBookingPage - 1) * bookingPageSize;
      const endIndex = startIndex + bookingPageSize;
      const paginatedBookings = bookingsWithUserDetails.slice(
        startIndex,
        endIndex
      );
      setRoomBookings(paginatedBookings);
    } catch (error) {
      message.error("Lỗi khi hiển thị đặt phòng cho phòng này.");
      console.error("Error filtering and processing room bookings:", error);
      setRoomBookings([]);
      setTotalBookingItems(0);
    } finally {
      setLoading(false);
      console.log("Booking filter loading set to false.");
    }
  }, [
    selectedRoom,
    allBookingsLoaded,
    usersMap,
    currentBookingPage,
    bookingPageSize,
  ]);

  useEffect(() => {
    console.log(
      "useEffect: selectedRoom, filterBookingsForSelectedRoom, initialLoading, currentBookingPage, or bookingPageSize changed."
    );
    if (selectedRoom && !initialLoading) {
      console.log(
        "   Calling filterBookingsForSelectedRoom because selectedRoom is not null and initial loading is done."
      );
      filterBookingsForSelectedRoom();
    } else if (!selectedRoom) {
      console.log("   No room selected, deferring booking filter.");
    } else if (initialLoading) {
      console.log("   Initial loading not done, deferring booking filter.");
    }
  }, [
    selectedRoom,
    filterBookingsForSelectedRoom,
    initialLoading,
    currentBookingPage,
    bookingPageSize,
  ]);

  const handleRoomPageChange = (page, pageSize) => {
    console.log(`handleRoomPageChange: page=${page}, pageSize=${pageSize}`);
    setCurrentRoomPage(page);
    setRoomPageSize(pageSize);
  };

  const handleSearchRoom = (value) => {
    console.log(`handleSearchRoom: value=${value}`);
    setRoomSearchTerm(value);
    setCurrentRoomPage(1);
  };

  const handleSelectRoom = (room) => {
    console.log("handleSelectRoom: Selected room:", room);
    setSelectedRoom(room);
    setCurrentBookingPage(1);
    setBookingPageSize(10);
    setRoomBookings([]);
    setTotalBookingItems(0);
  };

  const handleBackToRoomList = () => {
    console.log("handleBackToRoomList: Back to room list.");
    setSelectedRoom(null);
    setRoomBookings([]);
    setTotalBookingItems(0);
  };

  const handleOpenAddBookingModal = () => {
    console.log("handleOpenAddBookingModal: Opening add booking modal.");
    if (!selectedRoom || !selectedRoom.id) {
      message.error("Vui lòng chọn một phòng để tạo đặt phòng.");
      return;
    }
    setIsAddBookingModalVisible(true);
  };

  const handleDeleteBooking = async (e, record) => {
    e.stopPropagation();
    console.log("handleDeleteBooking: Deleting booking record:", record);
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa đặt phòng này?`,
      content: `ID: ${record.id} - Người đặt: ${
        record.userDetails?.name || record.userDetails?.email || "Không rõ"
      }`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          await deleteBookingById(record.id);
          message.success("Xóa đặt phòng thành công");
          console.log(
            "Booking deleted successfully. Re-fetching all bookings and filtering."
          );

          await fetchAllBookings();
          filterBookingsForSelectedRoom();
        } catch (error) {
          message.error("Xóa đặt phòng thất bại");
          console.error("Lỗi khi xóa đặt phòng:", error);
        }
      },
    });
  };

  return (
    <>
      {!selectedRoom ? (
        <BookingRoomList
          rooms={rooms}
          loading={loading}
          roomSearchTerm={roomSearchTerm}
          handleSearchRoom={handleSearchRoom}
          currentRoomPage={currentRoomPage}
          roomPageSize={roomPageSize}
          totalRooms={totalRooms}
          handleRoomPageChange={handleRoomPageChange}
          onSelectRoom={handleSelectRoom}
        />
      ) : (
        <BookingRoomDetail
          room={selectedRoom}
          bookings={roomBookings}
          loading={loading}
          currentPage={currentBookingPage}
          pageSize={bookingPageSize}
          total={totalBookingItems}
          onBack={handleBackToRoomList}
          onPageChange={(page, pageSize) => {
            console.log(
              `BookingRoomDetail: Pagination changed to page=${page}, pageSize=${pageSize}`
            );
            setCurrentBookingPage(page);
            setBookingPageSize(pageSize);
          }}
          onDeleteBooking={handleDeleteBooking}
          getStatusTag={getStatusTag}
          onEditBooking={(booking) => {
            setSelectedBooking(booking);
            setIsDetailModalVisible(true);
            console.log("Opening edit booking modal for booking:", booking);
          }}
          handleCreateBooking={handleOpenAddBookingModal}
        />
      )}

      <Modal
        open={isDetailModalVisible}
        title="Chỉnh sửa đặt phòng"
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedBooking(null);
          console.log("Closing edit booking modal.");
        }}
        footer={null}
        destroyOnHidden 
      >
        {selectedBooking && selectedRoom && (
          <BookingAdminForm
            visible={isDetailModalVisible}
            booking={selectedBooking}
            room={selectedRoom} 
            onSuccess={async () => {
              await fetchAllBookings();
              filterBookingsForSelectedRoom();
              setIsDetailModalVisible(false);
              setSelectedBooking(null); 
            }}
            onCancel={() => {
              setIsDetailModalVisible(false);
              setSelectedBooking(null);
            }}
            getStatusTag={getStatusTag}
            isSmallScreen={isSmallScreen}
          />
        )}
      </Modal>

      <Modal
        open={isAddBookingModalVisible}
        title={`Tạo đặt phòng mới cho Phòng: ${selectedRoom?.tenPhong || ""}`}
        onCancel={() => {
          setIsAddBookingModalVisible(false);
          console.log("Closing add booking modal.");
        }}
        footer={null}
        destroyOnHidden
      >
        {selectedRoom && (
          <AddBookingAdmin
            room={selectedRoom}
            onSuccess={async () => {
              await fetchAllBookings();
              filterBookingsForSelectedRoom();
              setIsAddBookingModalVisible(false);
            }}
            onCancel={() => {
              setIsAddBookingModalVisible(false);
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default BookingAdmin;
