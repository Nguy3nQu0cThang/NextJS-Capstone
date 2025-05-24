"use client";

import React, { useEffect, useReducer } from "react";
import { Card, Col, Row, Spin, Tag, Table } from "antd";
import { Pie, Column } from "@ant-design/charts";
import { getAllRoomsDashboard } from "app/services/roomService";
import { getAllBookings } from "app/services/bookingService";
import { getAllUsers } from "app/services/userService";
import {
  dashboardReducer,
  initialDashboardState,
} from "app/redux/dashboadReducer/dashboardReducer";
import TopLocations from "./TopLocations";

const DashBoard = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);

  const fetchDashboardData = async () => {
    dispatch({ type: "SET_LOADING" });
    const [users, rooms, bookings] = await Promise.all([
      getAllUsers(),
      getAllRoomsDashboard(),
      getAllBookings(),
    ]);
    dispatch({ type: "SET_DATA", payload: { users, rooms, bookings } });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalUsers = state.users.length;
  const totalRooms = state.rooms.length;
  const totalBookings = state.bookings.length;
  const bookedRoomIds = new Set(state.bookings.map((b) => b.maPhong));
  const existingRoomIds = new Set(state.rooms.map((room) => room.id));
  const validBookedRoomIds = new Set(
    state.bookings.map((b) => b.maPhong).filter((id) => existingRoomIds.has(id))
  );
  const availableRooms = Math.max(0, totalRooms - validBookedRoomIds.size);
  const bookingsByMonth = {};
  const countPerDay = {};
  state.bookings.forEach((b) => {
    const date = b.ngayDen?.split("T")[0];
    if (date) {
      countPerDay[date] = (countPerDay[date] || 0) + 1;
    }
  });
  state.bookings.forEach((b) => {
    const dateStr = b.ngayDen?.split("T")[0];
    if (!dateStr) return;

    const date = new Date(dateStr);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    bookingsByMonth[key] = (bookingsByMonth[key] || 0) + 1;
  });

  const chartDataByMonth = Object.entries(bookingsByMonth).map(
    ([month, count]) => ({
      month,
      count,
    })
  );
  const sorted = [...chartDataByMonth].sort((a, b) => b.count - a.count);
  const peakMonth = sorted[0];
  const lowMonth = sorted[sorted.length - 1];
  console.table(countPerDay);
  const chartDataByDate = Object.values(
    state.bookings.reduce((acc, cur) => {
      if (!cur.ngayDen) return acc;
      const date = cur.ngayDen.split("T")[0];
      if (!date) return acc;

      acc[date] = acc[date] || { date, count: 0 };
      acc[date].count += 1;
      return acc;
    }, {})
  );

  const pieData = [
    { type: "Đã đặt", value: bookedRoomIds.size },
    { type: "Còn trống", value: availableRooms },
  ];

  const topRooms = Object.values(
    state.bookings.reduce((acc, cur) => {
      const roomId = cur.maPhong;
      acc[roomId] = acc[roomId] || { maPhong: roomId, count: 0 };
      acc[roomId].count += 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      tenPhong:
        state.rooms.find((room) => room.id === item.maPhong)?.tenPhong ||
        "Không rõ",
    }));

  const topRoomColumns = [
    { title: "Phòng", dataIndex: "tenPhong", key: "tenPhong" },
    { title: "Số lượt đặt", dataIndex: "count", key: "count" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>Dashboard</h2>

      {state.loading ? (
        <Spin size="large" />
      ) : (
        <>
          {/* Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card title="Người dùng" variant="borderless">
                {totalUsers}
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Phòng" variant="borderless">
                {totalRooms}
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Đơn đặt" variant="borderless">
                {totalBookings}
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Phòng còn trống" variant="borderless">
                <Tag color="green">{availableRooms}</Tag>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Lượt đặt phòng theo ngày">
                <Column
                  data={chartDataByDate}
                  xField="date"
                  yField="count"
                  height={300}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Tỉ lệ phòng đã đặt">
                <Pie
                  data={pieData}
                  angleField="value"
                  colorField="type"
                  height={300}
                />
              </Card>
            </Col>
          </Row>

          {/* Top rooms */}
          <Card
            title="Top 5 phòng được đặt nhiều nhất"
            style={{ marginTop: 24 }}
          >
            <Table
              columns={topRoomColumns}
              dataSource={topRooms}
              rowKey="maPhong"
              pagination={false}
            />
          </Card>
          <TopLocations />
          <Column
            title="Lượt đặt phòng trong năm"
            data={chartDataByMonth}
            xField="month"
            yField="count"
            height={300}
            tooltip={{
              formatter: (d) => ({ name: "Lượt đặt", value: d.count }),
            }}
            label={{ position: "top" }}
            xAxis={{
              label: { autoHide: true, autoRotate: false },
            }}
          />
          <Row gutter={16} style={{ marginTop: 20 }}>
            <Col span={12}>
              <Card title="📈 Tháng cao điểm">
                {peakMonth?.month}: <strong>{peakMonth?.count}</strong> lượt đặt
              </Card>
            </Col>
            <Col span={12}>
              <Card title="📉 Tháng thấp điểm">
                {lowMonth?.month}: <strong>{lowMonth?.count}</strong> lượt đặt
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default DashBoard;
