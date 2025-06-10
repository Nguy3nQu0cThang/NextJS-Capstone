"use client";

import { useEffect, useState } from "react";
import { ArrowUpOutlined } from "@ant-design/icons";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  const handleScroll = () => {
    setVisible(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`back-to-top ${visible ? "show" : ""}`}
      aria-label="Lên đầu trang"
    >
      <ArrowUpOutlined />
    </button>
  );
};

export default BackToTop;
