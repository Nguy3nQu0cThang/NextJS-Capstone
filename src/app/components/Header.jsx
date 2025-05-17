"use client";

import { useEffect, useReducer } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";
import { Layout, Button, Dropdown, DatePicker, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Image from "next/image";
import {
  getListLocations,
  getRoomsByLocation,
} from "app/services/bookingService";
import { headerReducer, initialState } from "app/redux/reducer/store";
import UserMenu from "./User/UserMenu";
import { useAuth } from "app/context/AuthContext";
import AuthModal from "./auth/AuthModal";
import Link from "next/link";

const { Header: AntHeader } = Layout;
const { RangePicker } = DatePicker;
const Header = ({ onSearch }) => {
  const [state, dispatch] = useReducer(headerReducer, initialState);
  const {
    isLoggedIn,
    userName,
    logout,
    showModal,
    isModalOpen,
    modalMode,
    setIsModalOpen,
    setModalMode,
    handleCancel,
  } = useAuth();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await getListLocations();
        dispatch({ type: "SET_LOCATIONS", payload: res.data.content });
      } catch (err) {
        console.error("Lỗi khi lấy danh sách vị trí:", err);
      }
    };

    fetchLocations();
  }, []);

  const updateGuest = (type, delta) => {
    dispatch({ type: "SET_GUEST_COUNT", payload: { type, delta } });
  };

  const guestDropdown = (
    <div style={{ width: 250, padding: 12 }}>
      {[
        { label: "Người lớn", type: "adults", desc: "Từ 13 tuổi trở lên" },
        { label: "Trẻ em", type: "children", desc: "Tuổi 2–12" },
        { label: "Em bé", type: "infants", desc: "Dưới 2 tuổi" },
      ].map(({ label, type, desc }) => (
        <div key={type} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{desc}</div>
            </div>
            <div>
              <Button
                onClick={() => updateGuest(type, -1)}
                size="small"
                disabled={state.guestCounts[type] === 0}
              >
                -
              </Button>
              <span style={{ margin: "0 8px" }}>{state.guestCounts[type]}</span>
              <Button onClick={() => updateGuest(type, 1)} size="small">
                +
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const guestLabel = () => {
    const { adults, children, infants } = state.guestCounts;
    const total = adults + children;
    if (total === 0 && infants === 0) return "Thêm khách";

    let label = `${total} khách`;
    if (infants > 0) label += `, ${infants} em bé`;
    return label;
  };

  const locationLabel = state.selectedLocation
    ? `${state.selectedLocation.tenViTri} - ${state.selectedLocation.tinhThanh}`
    : "Địa điểm bất kỳ";

  const dateLabel =
    state.dates?.length === 2
      ? `${dayjs(state.dates[0]).format("D [thg] M")} - ${dayjs(
          state.dates[1]
        ).format("D [thg] M")}`
      : "Thời gian";

  const locationMenu = {
    items: (state.locations || []).map((item) => ({
      key: item.id,
      label: item.tenViTri + " - " + item.tinhThanh,
      onClick: () => dispatch({ type: "SET_LOCATION", payload: item }),
    })),
  };

  const handleSearch = async () => {
    if (!state.selectedLocation || state.dates.length !== 2) {
      message.warning("Vui lòng chọn đầy đủ địa điểm và ngày ở!");
      return;
    }

    if (onSearch) {
      onSearch(state.selectedLocation.id);
    }

    try {
      const res = await getRoomsByLocation(state.selectedLocation.id);
      console.log("Kết quả phòng:", res.data.content);
    } catch (err) {
      console.error("Lỗi khi tìm phòng:", err);
      message.error("Không thể tải danh sách phòng!");
    }
  };

  return (
    <AntHeader
      style={{
        display: "flex",
        alignItems: "center",
        background: "#fff",
        padding: "0 40px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        height: "80px",
        width: "100%",
      }}
    >
      <div style={{ position: "relative", width: 192, height: 120 }}>
        <Link
          href="/"
          style={{
            display: "block",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <Image
            src="/Airbnb-Logo.wine.png"
            alt="Airbnb"
            fill
            sizes="(max-width: 600px) 100vw, 200px"
            style={{ objectFit: "contain", cursor: "pointer" }}
          />
        </Link>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          border: "1px solid #ddd",
          borderRadius: "999px",
          padding: "0px 20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Dropdown menu={locationMenu} trigger={["click"]}>
          <span style={{ cursor: "pointer" }}>{locationLabel}</span>
        </Dropdown>
        <div style={{ height: 16, borderLeft: "1px solid #ddd" }} />
        <RangePicker
          locale={locale}
          format="DD/MM/YYYY"
          className="w-full rounded-lg shadow-sm"
          value={state.dates}
          onChange={(val) => dispatch({ type: "SET_DATES", payload: val })}
          allowClear={false}
        />
        <div style={{ height: 16, borderLeft: "1px solid #ddd" }} />
        <Dropdown
          open={state.guestOpen}
          onOpenChange={() => dispatch({ type: "TOGGLE_GUEST" })}
          dropdownRender={() => (
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {guestDropdown}
            </div>
          )}
        >
          <span style={{ cursor: "pointer" }}>{guestLabel()}</span>
        </Dropdown>
        <Button
          shape="circle"
          icon={<SearchOutlined />}
          type="primary"
          style={{ backgroundColor: "#ff385c", borderColor: "#ff385c" }}
          onClick={handleSearch}
        />
      </div>

      <UserMenu
        isLoggedIn={isLoggedIn}
        userName={userName}
        logout={logout}
        showModal={showModal}
      />

      <AuthModal
        isModalOpen={isModalOpen}
        modalMode={modalMode}
        handleCancel={handleCancel}
        setIsModalOpen={setIsModalOpen}
        setModalMode={setModalMode}
      />
    </AntHeader>
  );
};

export default Header;
