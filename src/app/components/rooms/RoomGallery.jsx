"use client";

import Image from "next/image";

const RoomGallery = ({ images }) => {
  if (!images || images.length === 0) {
    return <div>Không có hình ảnh để hiển thị.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Ảnh phòng ${idx + 1}`}
          className="w-full h-[300px] object-cover rounded-xl"
        />
      ))}
    </div>
  );
};

export default RoomGallery;
