"use client";

import { useEffect, useReducer } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";
import {
  Layout,
  Menu,
  Button,
  Space,
  Dropdown,
  DatePicker,
} from "antd";
import {
  GlobalOutlined,
  MenuOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { getListLocations, getRoomsByLocation } from "app/services/bookingService";
import { headerReducer, initialState } from "app/redux/reducer/store";

const { Header: AntHeader } = Layout;

const Header = () => {
  const [state, dispatch] = useReducer(headerReducer, initialState);

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
      ? `${dayjs(state.dates[0]).format("D [thg] M")} - ${dayjs(state.dates[1]).format("D [thg] M")}`
      : "Thời gian";

  const locationMenu = {
    items: (state.locations || []).map((item) => ({
      key: item.id,
      label: item.tenViTri + " - " + item.tinhThanh,
      onClick: () => dispatch({ type: "SET_LOCATION", payload: item }),
    })),
  };

  const userMenu = (
    <Menu
      items={[
        { label: "Đăng ký", key: "signup" },
        { label: "Đăng nhập", key: "login" },
        { type: "divider" },
        { label: "Trợ giúp", key: "help" },
      ]}
    />
  );

  const handleSearch = async () => {
    if (!state.selectedLocation || state.dates.length !== 2) {
      alert("Vui lòng chọn đầy đủ địa điểm và ngày ở!");
      return;
    }

    const params = {
      maViTri: state.selectedLocation.id,
      checkIn: dayjs(state.dates[0]).format("YYYY-MM-DD"),
      checkOut: dayjs(state.dates[1]).format("YYYY-MM-DD"),
      guests: { ...state.guestCounts },
    };

    try {
      const res = await getRoomsByLocation(state.selectedLocation.id);
      console.log("Kết quả phòng:", res.data.content);
    } catch (err) {
      console.error("Lỗi khi tìm phòng:", err);
    }
  };

  return (
    <AntHeader
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        padding: "0 40px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        height: "64px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Image src="/airbnb-logo.png" alt="Airbnb" width={100} height={32} />
      </div>

      <Space
        size="middle"
        style={{
          border: "1px solid #ddd",
          borderRadius: "999px",
          padding: "6px 16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Dropdown menu={locationMenu} trigger={["click"]}>
          <span style={{ cursor: "pointer" }}>{locationLabel}</span>
        </Dropdown>
        <div style={{ height: 16, borderLeft: "1px solid #ddd" }} />
        <Dropdown
          open={state.openDate}
          onOpenChange={() => dispatch({ type: "TOGGLE_DATE" })}
          dropdownRender={() => (
            <div style={{ position: "relative", padding: 8 }}>
              <Button
                shape="circle"
                size="small"
                onClick={() => dispatch({ type: "TOGGLE_DATE" })}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  zIndex: 10,
                  backgroundColor: "#f5f5f5",
                  border: "none",
                }}
              >
                ✕
              </Button>
              <DatePicker.RangePicker
                locale={locale}
                format="DD/MM/YYYY"
                value={state.dates}
                onCalendarChange={(val) => dispatch({ type: "SET_DATES", payload: val })}
                style={{ width: "100%" }}
                allowClear={false}
                open={true}
              />
            </div>
          )}
        >
          <span style={{ cursor: "pointer" }}>{dateLabel}</span>
        </Dropdown>
        <div style={{ height: 16, borderLeft: "1px solid #ddd" }} />
        <Dropdown
          open={state.guestOpen}
          onOpenChange={() => dispatch({ type: "TOGGLE_GUEST" })}
          dropdownRender={() => guestDropdown}
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
      </Space>

      <Space size="middle">
        <span style={{ cursor: "pointer", fontSize: "14px" }}>Booking</span>
        <GlobalOutlined style={{ fontSize: "16px", cursor: "pointer" }} />
        <Dropdown menu={userMenu} trigger={["click"]}>
          <Button icon={<MenuOutlined />} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <UserOutlined />
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
