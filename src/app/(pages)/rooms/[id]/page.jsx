"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRoomDetail } from "app/services/roomService";
import RoomGallery from "app/components/rooms/RoomGallery";
import RoomHeader from "app/components/rooms/RoomHeader";
import RoomDetails from "app/components/rooms/RoomDetails";
import RoomBookingCard from "app/components/rooms/RoomBookingCard";
import RoomReviews from "app/components/rooms/RoomReviews";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import { useAuth } from "app/context/AuthContext";

const RoomDetailPage = () => {
  const { id } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  const RoomMap = dynamic(() => import("app/components/rooms/RoomMap"), {
    ssr: false,
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await getRoomDetail(id);
        setRoomData(res.data.content);
      } catch (error) {
        console.error("Lỗi lấy chi tiết phòng:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
        <div className="text-gray-500 mt-4">Đang tải dữ liệu phòng...</div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="text-center mt-10 text-red-500">
        Không tìm thấy phòng!
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative w-full h-auto overflow-hidden mb-6">
        <RoomGallery images={[roomData.hinhAnh]} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-6 pb-20">
          <RoomHeader room={roomData} />
          <RoomDetails room={roomData} />
          <RoomReviews roomId={roomData.id} user={userProfile} />
          <RoomMap room={roomData} />
        </div>

        <div className="relative">
          <div className="sticky top-24">
            <RoomBookingCard room={roomData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
