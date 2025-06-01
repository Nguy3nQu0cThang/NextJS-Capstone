"use client";

import React, { useEffect, useState } from "react";
import { Table, Card, Spin, message } from "antd";
import {
  getAllBookings,
  getAllLocationsDashboard,
} from "@/app/services/bookingService";
import { getAllRoomsDashboard } from "@/app/services/roomService";

const TopLocations = () => {
  const [loading, setLoading] = useState(true);
  const [topLocations, setTopLocations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomsResponse, bookingsResponse, locationsResponse] =
          await Promise.all([
            getAllRoomsDashboard(),
            getAllBookings(),
            getAllLocationsDashboard(),
          ]);

        const rooms =
          roomsResponse?.content || roomsResponse?.data || roomsResponse || [];
        const bookings =
          bookingsResponse?.content ||
          bookingsResponse?.data ||
          bookingsResponse ||
          [];
        const locations =
          locationsResponse?.content ||
          locationsResponse?.data ||
          locationsResponse ||
          [];

        const roomToLocationMap = new Map();
        rooms.forEach((room) => {
          roomToLocationMap.set(room.id, room.maViTri);
        });

        const locationCount = {};
        bookings.forEach((booking) => {
          const locationId = roomToLocationMap.get(booking.maPhong);
          if (!locationId) return;
          locationCount[locationId] = (locationCount[locationId] || 0) + 1;
        });

        const enriched = Object.entries(locationCount)
          .map(([locationId, count]) => {
            const location = locations.find((l) => l.id === Number(locationId));
            return {
              key: locationId,
              name: location?.tenViTri || "Không rõ",
              tinhThanh: location?.tinhThanh || "Không rõ",
              count,
            };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTopLocations(enriched);
      } catch (error) {
        console.error("Lỗi khi tải top khu vực:", error);
        message.error("Không thể tải top khu vực.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { title: "Tên vị trí", dataIndex: "name", key: "name" },
    { title: "Tỉnh thành", dataIndex: "tinhThanh", key: "tinhThanh" },
    { title: "Lượt đặt", dataIndex: "count", key: "count" },
  ];

  return (
    <Card title="Top 5 khu vực được đặt nhiều nhất" style={{ marginTop: 24 }}>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table columns={columns} dataSource={topLocations} pagination={false} />
      )}
    </Card>
  );
};

export default TopLocations;
