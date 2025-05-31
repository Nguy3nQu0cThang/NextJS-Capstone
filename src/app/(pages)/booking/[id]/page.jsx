"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import BookingBusinessToggle from "app/components/booking/BookingBusinessToggle";
import BookingConfirmButton from "app/components/booking/BookingConfirmButton";
import BookingDateGuest from "app/components/booking/BookingDateGuest";
import BookingPriceBreakdown from "app/components/booking/BookingPriceBreakdown";
import BookingRoomInfo from "app/components/booking/BookingRoomInfo";
import BookingUserForm from "app/components/booking/BookingUserForm";
import { getRoomDetail } from "app/services/roomService";
import { useAuth } from "app/context/AuthContext";

const BookingPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const [roomData, setRoomData] = useState(null);
  const { userProfile } = useAuth();
  const roomId = params?.id;
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const numberOfGuests = parseInt(searchParams.get("numberOfGuests") || "1");

  useEffect(() => {
    if (!roomId) return;
    const fetchRoom = async () => {
      try {
        const res = await getRoomDetail(roomId);
        setRoomData(res.data.content);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin phòng:", err);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  if (!roomData) {
    return <div className="text-center mt-10">Đang tải thông tin phòng...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <BookingRoomInfo room={roomData} />
        <BookingDateGuest
          roomId={roomData.id}
          checkin={checkin}
          checkout={checkout}
          guests={numberOfGuests}
        />
        <BookingUserForm user={userProfile}/>
        <BookingBusinessToggle />
      </div>

      <div className="md:col-span-1 space-y-6">
        <BookingPriceBreakdown
          room={roomData}
          checkin={checkin}
          checkout={checkout}
          guests={numberOfGuests}
        />
        <BookingConfirmButton
          roomId={roomId}
          checkin={checkin}
          checkout={checkout}
          guestCount={numberOfGuests}
          userId={userProfile?.id}
        />
      </div>
    </div>
  );
};

export default BookingPage;
