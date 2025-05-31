"use client";

import {
  UserOutlined,
  HomeOutlined,
  RestOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Card, Typography, Row, Col } from "antd";

const { Title, Paragraph } = Typography;

const RoomDetails = ({ room }) => {
  if (!room) return null;

  return (
    <div className="container mx-auto px-4">
      <Card
        variant="filled"
        className="shadow-md rounded-xl"
        style={{ background: "#fafafa" }}
      >
        <Title level={4} className="mb-3">
          Giới thiệu
        </Title>
        <Paragraph className="text-gray-700">
          {room.moTa || "Không có mô tả chi tiết."}
        </Paragraph>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={12} md={6}>
            <div className="flex items-center gap-2">
              <UserOutlined className="text-lg text-primary" />
              <span>{room.khach} khách</span>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="flex items-center gap-2">
              <HomeOutlined className="text-lg text-primary" />
              <span>{room.phongNgu} phòng ngủ</span>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="flex items-center gap-2">
              <AppstoreOutlined className="text-lg text-primary" />
              <span>{room.giuong} giường</span>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="flex items-center gap-2">
              <RestOutlined className="text-lg text-primary" />
              <span>{room.phongTam} phòng tắm</span>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default RoomDetails;
