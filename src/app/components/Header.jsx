"use client";

import { useEffect, useReducer, useState } from "react";
import { usePathname } from "next/navigation"; // Thêm usePathname
import dayjs from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";
import { Layout, Button, Dropdown, DatePicker, message, Modal } from "antd";
import { SearchOutlined, MenuOutlined } from "@ant-design/icons";
import Image from "next/image";
import { getRoomsByLocation } from "app/services/roomService";
import { getListLocations } from "app/services/bookingService";
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

  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  // Lấy đường dẫn hiện tại
  const pathname = usePathname();
  const isHomePage = pathname === "/"; // Chỉ hiển thị searchBar ở trang Home

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
    <div className="guest-dropdown" style={{ width: 250, padding: 12 }}>
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

  const locationMenu = {
    items: (state.locations || []).map((item) => ({
      key: item.id,
      label: item.tenViTri + " - " + item.tinhThanh,
      onClick: () => dispatch({ type: "SET_LOCATION", payload: item }),
    })),
  };

  const handleSearch = async () => {
    if (!state.selectedLocation || state.dates?.length !== 2) {
      message.warning("Vui lòng chọn đầy đủ địa điểm và ngày ở!");
      return;
    }

    if (onSearch) {
      onSearch(state.selectedLocation.id);
    }

    try {
      const res = await getRoomsByLocation(state.selectedLocation.id);
      console.log("Kết quả phòng:", res.data.content);
      setIsSearchModalVisible(false);
    } catch (err) {
      console.error("Lỗi khi tìm phòng:", err);
      message.error("Không thể tải danh sách phòng!");
    }
  };

  const searchBar = (
    <div className="search-bar">
      {/* Địa điểm */}
      <Dropdown menu={locationMenu} trigger={["click"]}>
        <span className="dropdown-label" style={{ cursor: "pointer" }}>
          {locationLabel}
        </span>
      </Dropdown>

      <div
        className="divider"
        style={{ height: 16, borderLeft: "1px solid #ddd" }}
      />

      {/* Thời gian */}
      <Dropdown
        trigger={["click"]}
        open={state.dateOpen}
        onOpenChange={() => dispatch({ type: "TOGGLE_DATE" })}
        popupRender={() => (
          <div
            style={{
              background: "#fff",
              padding: 12,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <RangePicker
              locale={locale}
              format="DD/MM/YYYY"
              value={state.dates}
              open={isDateOpen}
              onOpenChange={(open) => setIsDateOpen(open)}
              allowClear={false}
              onChange={(val) => {
                dispatch({ type: "SET_DATES", payload: val });
                if (val && val.length === 2 && val[0] && val[1]) {
                  setTimeout(() => setIsDateOpen(false), 150); // đóng sau khi chọn đủ ngày
                }
              }}
            />
          </div>
        )}
      >
        <span className="dropdown-label" style={{ cursor: "pointer" }}>
          {state.dates?.length === 2 && state.dates[0] && state.dates[1]
            ? `${dayjs(state.dates[0]).format("D [thg] M")} - ${dayjs(
                state.dates[1]
              ).format("D [thg] M")}`
            : "Thời gian"}
        </span>
      </Dropdown>

      <div
        className="divider"
        style={{ height: 16, borderLeft: "1px solid #ddd" }}
      />

      {/* Số khách */}
      <Dropdown
        open={state.guestOpen}
        onOpenChange={() => dispatch({ type: "TOGGLE_GUEST" })}
        popupRender={() => (
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            {guestDropdown}
          </div>
        )}
      >
        <span className="dropdown-label" style={{ cursor: "pointer" }}>
          {guestLabel()}
        </span>
      </Dropdown>

      <Button
        shape="circle"
        icon={<SearchOutlined />}
        type="primary"
        style={{ backgroundColor: "#ff385c", borderColor: "#ff385c" }}
        onClick={handleSearch}
      />
    </div>
  );

  return (
    <>
      <AntHeader
        className="header"
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--background)",
          color: "var(--foreground)",
          padding: "0 40px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          height: "80px",
          width: "100%",
        }}
      >
        <div className="header-logo">
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

        {/* Chỉ hiển thị searchBar ở trang Home */}
        {isHomePage && (
          <div
            className="search-bar-container"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            {searchBar}
          </div>
        )}

        <div className="search-toggle-mobile">
          <Button
            icon={<SearchOutlined />}
            onClick={() => setIsSearchModalVisible(true)}
            style={{ borderRadius: "999px", padding: "8px 16px" }}
          >
            Tìm kiếm
          </Button>
        </div>

        <UserMenu
          isLoggedIn={isLoggedIn}
          userName={userName}
          logout={logout}
          showModal={showModal}
        />
      </AntHeader>

      <Modal
        title="Tìm kiếm"
        open={isSearchModalVisible}
        onCancel={() => setIsSearchModalVisible(false)}
        footer={null}
        style={{ top: 20 }}
      >
        {searchBar}
      </Modal>

      <AuthModal
        isModalOpen={isModalOpen}
        modalMode={modalMode}
        handleCancel={handleCancel}
        setIsModalOpen={setIsModalOpen}
        setModalMode={setModalMode}
      />
    </>
  );
};

export default Header;