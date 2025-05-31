"use client";

import Image from "next/image";

const RoomGallery = ({ images }) => {
  if (!images || images.length === 0) {
    return <div>Không có hình ảnh để hiển thị.</div>;
  }

  if (images.length === 1) {
    return (
      <div className="rounded-2xl overflow-hidden">
        <img
          src={images[0]}
          alt="Ảnh phòng"
          className="w-full h-[300px] md:h-[500px] object-cover rounded-2xl"
        />
      </div>
    );
  }

  const mainImage = images[0];
  const subImages = images.slice(1, 5);


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-2xl overflow-hidden">
      {/* Ảnh chính */}
      <div className="md:col-span-2 h-[300px] md:h-[500px]">
        <img
          src={mainImage}
          alt="Ảnh chính"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>

      {/* Các ảnh phụ */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[300px] md:h-[500px]">
        {subImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Ảnh phụ ${idx + 1}`}
            className="w-full h-full object-cover rounded-xl"
          />
        ))}
      </div>
    </div>
  );
};

export default RoomGallery;