"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRoomDetail } from "app/services/roomService";
import RoomGallery from "app/components/rooms/RoomGallery";
import RoomHeader from "app/components/rooms/RoomHeader";
import RoomDetails from "app/components/rooms/RoomDetails";
import RoomBookingCard from "app/components/rooms/RoomBookingCard";
import RoomReviews from "app/components/rooms/RoomReviews";
import RoomMap from "app/components/rooms/RoomMap";

const RoomDetailPage = () => {
  const { id } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await getRoomDetail(id);
        console.log("Room data:", res.data.content);
        setRoomData(res.data.content);
      } catch (error) {
        console.error("Lỗi lấy chi tiết phòng:", error);
      } finally {
        setLoading(false);
      }
      console.log("room id:", id);
    };

    if (id) {
      fetchRoom();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center mt-10">Đang tải dữ liệu phòng...</div>;
  }

  if (!roomData) {
    return (
      <div className="text-center mt-10 text-red-500">
        Không tìm thấy phòng!
      </div>
    );
  }
  console.log("roomData.id:", roomData?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative w-full h-auto overflow-hidden">
        <RoomGallery images={[roomData.hinhAnh]} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2 space-y-6">
          <RoomHeader room={roomData} />
          <RoomDetails room={roomData} />
          <RoomReviews roomId={roomData.id} />
          <RoomMap room={roomData} />
        </div>

        <div className="md:col-span-1">
          <RoomBookingCard room={roomData} />
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
