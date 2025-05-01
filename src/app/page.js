// export const metadata = {
//   title: "AirBnb | Cybersoft",
//   description: "Trang web dành cho AirBnb.",
//   keywords: ["AirBnb", "nơi ở", "cybersoft", "nextjs"],
//   openGraph: {
//     title: "AirBnb | Cybersoft",
//     description: "Trang web dành cho AirBnb.",
//     images: [
//       {
//         url: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fgithub.com%2Fairbnb&psig=AOvVaw2n-JKJYZyH2KK-hMgBanS8&ust=1745645668626000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJCU-4G78owDFQAAAAAdAAAAABAE",
//         width: 800,
//         height: 600,
//         alt: "",
//       },
//     ],
//   },
// };
"use client"
import { Layout } from "antd";
import LocationList from "./components/main/LocationList";
import { useState } from "react";


const { Content, Footer } = Layout;

export default function HomePage() {
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ marginTop: "80px", padding: "0 50px" }}>
        <div style={{ minHeight: "500px", padding: "24px 0" }}>
          <h1>Trang chủ Airbnb Clone</h1>
          <LocationList selectedLocationId={selectedLocationId}/>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Airbnb Clone ©{new Date().getFullYear()} Created by Thắng
      </Footer>
    </Layout>
  );
}
