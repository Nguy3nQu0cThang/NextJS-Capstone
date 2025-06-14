"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import { useAuth } from "./context/AuthContext";
import AppFooter from "./components/Footer";
import "antd/dist/reset.css";
import "@/app/globals.css"; 
import "leaflet/dist/leaflet.css";
import "@ant-design/v5-patch-for-react-19";
import BackToTop from "./components/BackToTop";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Component con để sử dụng useAuth
const InnerLayout = ({ children }) => {
  const { setSelectedLocationId } = useAuth(); // Gọi useAuth trong phạm vi AuthProvider

  return (
    <>
      <Header onSearch={setSelectedLocationId} />
      {children}
      <AppFooter/>
      <BackToTop/>
    </>
  );
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <InnerLayout>{children}</InnerLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
