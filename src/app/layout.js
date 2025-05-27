"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import "antd/dist/reset.css";
import { useAuth } from "./context/AuthContext";
import AppFooter from "./components/Footer";

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
