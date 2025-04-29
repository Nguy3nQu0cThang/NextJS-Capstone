"use client";

import { Card } from "antd";

const RoomMap = ({ room }) => {
  if (!room?.latitude || !room?.longitude) {
    return <p className="text-gray-500">Không có vị trí để hiển thị bản đồ.</p>;
  }

  const mapSrc = `https://www.google.com/maps?q=${room.latitude},${room.longitude}&z=15&output=embed`;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Vị trí</h2>
      <Card
        bordered
        style={{ borderRadius: 12, overflow: "hidden" }}
        bodyStyle={{ padding: 0 }}
      >
        <iframe
          src={mapSrc}
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </Card>
    </div>
  );
};

export default RoomMap;
