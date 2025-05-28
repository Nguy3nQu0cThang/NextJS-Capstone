"use client";

import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { Layout, Row, Col, Typography, Space } from "antd";
import { useState } from "react";

const { Footer } = Layout;
const { Text } = Typography;
const socialIcons = [
  { icon: <FacebookOutlined />, label: "Facebook" },
  { icon: <InstagramOutlined />, label: "Instagram" },
  { icon: <YoutubeOutlined />, label: "YouTube" },
  { icon: <TwitterOutlined />, label: "Twitter" },
];

const AppFooter = () => {
  const [hovered, setHovered] = useState(null);
  return (
    <Footer style={{ background: "#000", color: "#fff", padding: "24px 40px" }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Text style={{ color: "#fff" }}>
            Airbnb Clone ©{new Date().getFullYear()} Created by Nguyễn Quốc
            Thắng và Từ Triệu Dương
          </Text>
        </Col>

        <Col>
          <Space size="middle">
            {socialIcons.map((item, index) => (
              <a
                key={item.label}
                href="#"
                aria-label={item.label}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 18,
                    color: "#fff",
                    background: hovered === index ? "#ff4d4f" : "#333",
                    borderRadius: "50%",
                    padding: 8,
                    transition: "background 0.3s ease",
                  }}
                >
                  {item.icon}
                </span>
              </a>
            ))}
          </Space>
        </Col>
      </Row>
    </Footer>
  );
};

export default AppFooter;
