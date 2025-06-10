"use client";

import { Carousel } from "antd";
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



  return (
    <div className="rounded-2xl overflow-hidden">
      <Carousel
        autoplay
        dots
        className="rounded-2xl"
        arrows
        draggable
        effect="scrollx"
      >
        {images.map((img, idx) => (
          <div key={idx} className="h-[300px] md:h-[500px]">
            <img
              src={img}
              alt={`Ảnh ${idx + 1}`}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default RoomGallery;