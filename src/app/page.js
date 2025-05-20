"use client";

import { Layout } from "antd";
import LocationList from "./components/main/LocationList";
import { useAuth } from "./context/AuthContext";

const { Content, Footer } = Layout;

export default function HomePage() {
  const { selectedLocationId } = useAuth(); // Lấy selectedLocationId từ AuthContext

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ marginTop: "80px", padding: "0 50px" }}>
        <div style={{ minHeight: "500px", padding: "24px 0" }}>
          <h1>Trang chủ Airbnb Clone</h1>
          <LocationList selectedLocationId={selectedLocationId} />
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Airbnb Clone ©{new Date().getFullYear()} Created by Thắng
      </Footer>
    </Layout>
  );
}
