"use client";

import { Layout, Row, Col, Typography, Space, Divider } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  TwitterOutlined,
  GlobalOutlined,
  DollarOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Footer } = Layout;
const { Title, Link, Text } = Typography;

const AppFooter = () => {
  const [hovered, setHovered] = useState(null);

  const footerData = [
    {
      title: "ABOUT",
      items: [
        "How Airbnb works",
        "Newsroom",
        "Investors",
        "Airbnb Plus",
        "Airbnb Luxe",
        "HotelTonight",
        "Airbnb for Work",
        "Made possible by hosts",
        "Careers",
        "Founders' Letter",
      ],
    },
    {
      title: "COMMUNITY",
      items: [
        "Diversity & Belonging",
        "Accessibility",
        "Airbnb Associates",
        "Frontline Stays",
        "Guest Referrals",
        "Airbnb.org",
      ],
    },
    {
      title: "HOSTING",
      items: [
        "Host your home",
        "Host an online experience",
        "Host an experience",
        "Responsible hosting",
        "Resource Center",
        "Community Center",
      ],
    },
    {
      title: "SUPPORT",
      items: [
        "COVID-19 response",
        "Help Center",
        "Cancellation options",
        "Neighborhood Support",
        "Trust & Safety",
      ],
    },
  ];

  const socialIcons = [
    { icon: <FacebookOutlined />, label: "Facebook" },
    { icon: <InstagramOutlined />, label: "Instagram" },
    { icon: <YoutubeOutlined />, label: "YouTube" },
    { icon: <TwitterOutlined />, label: "Twitter" },
  ];

  return (
    <Footer style={{ background: "#f9f9f9", padding: "40px" }}>
      <Row gutter={[32, 24]}>
        {footerData.map((col) => (
          <Col xs={24} sm={12} md={6} key={col.title}>
            <Title level={5}>{col.title}</Title>
            <Space direction="vertical" size="small">
              {col.items.map((item) => (
                <Link key={item} href="#" style={{ color: "#555" }}>
                  {item}
                </Link>
              ))}
            </Space>
          </Col>
        ))}
      </Row>

      <Divider style={{ margin: "32px 0" }} />

      <Row justify="space-between" align="middle">
        <Col xs={24} md={12}>
          <Text type="secondary">
            © {new Date().getFullYear()} Airbnb Clone Created by Nguyễn Quốc
            Thắng và Từ Triệu Dương{" "}
            <Link href="#">Privacy</Link> · <Link href="#">Terms</Link> ·{" "}
            <Link href="#">Sitemap</Link>
          </Text>
        </Col>

        <Col xs={24} md={12} style={{ textAlign: "right" }}>
          <Space size="large">
            <Text>
              <GlobalOutlined /> English (US)
            </Text>
            <Text>
              <DollarOutlined /> USD
            </Text>
            <Link href="#">
              Resource support
            </Link>
            <Space>
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
                      fontSize: 16,
                      color: "#fff",
                      background: hovered === index ? "#ff4d4f" : "#555",
                      borderRadius: "50%",
                      padding: 6,
                      transition: "background 0.3s ease",
                    }}
                  >
                    {item.icon}
                  </span>
                </a>
              ))}
            </Space>
          </Space>
        </Col>
      </Row>
    </Footer>
  );
};

export default AppFooter;
