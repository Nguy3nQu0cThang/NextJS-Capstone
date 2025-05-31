"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Card, Spin } from "antd";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { getCoordinatesFromLocation } from "./useGeocode";
import { getAllLocations } from "app/services/bookingService";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const RoomMap = ({ room }) => {
  const [locationData, setLocationData] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await getAllLocations(); // lấy toàn bộ danh sách
        const location = res.content.find((item) => item.id === room?.maViTri);

        if (location) {
          setLocationData(location);
          const searchText = `${location.tenViTri}, ${location.tinhThanh}, ${location.quocGia}`;
          const coord = await getCoordinatesFromLocation(searchText);
          setCoordinates(coord);
        }
      } catch (err) {
        console.error("Lỗi khi lấy toạ độ:", err);
      } finally {
        setLoading(false);
      }
    };

    if (room?.maViTri) {
      fetchLocation();
    } else {
      setLoading(false);
    }
  }, [room?.maViTri]);

  if (loading)
  return (
    <Spin tip="Đang tải bản đồ...">
      <div style={{ height: 200 }} /> 
    </Spin>
  );

  if (!coordinates) {
    return <p className="text-gray-500">Không có toạ độ để hiển thị bản đồ.</p>;
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Vị trí</h2>
      <Card style={{ borderRadius: 12, overflow: "hidden" }}>
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: "350px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coordinates.lat, coordinates.lng]}>
            <Popup>
              {room?.tenPhong || "Phòng"} tại {locationData?.tenViTri},{" "}
              {locationData?.tinhThanh}, {locationData?.quocGia}
            </Popup>
          </Marker>
        </MapContainer>
      </Card>
    </div>
  );
};

export default RoomMap;
