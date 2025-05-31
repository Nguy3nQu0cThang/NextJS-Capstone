"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import { List, Card, Pagination } from "antd";
import { getAllRooms } from "app/services/roomService";

const ITEMS_PER_PAGE = 8;

const LocationList = ({ selectedLocationId }) => {
  const [allRooms, setAllRooms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getAllRooms();
        console.log("DATA ROOMS RESPONSE:", res.data.content); 
        setAllRooms(res.data.content || []);
        setRooms(res.data.content || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phòng thuê:", error);
      }
    };
    fetchRooms();
  }, []);
  
  useEffect(() => {
    if (selectedLocationId) {
      const filtered = allRooms.filter((room) => room.maViTri === selectedLocationId);
      setRooms(filtered);
      setCurrentPage(1);
    } else {
      setRooms(allRooms);
    }
  }, [selectedLocationId, allRooms]);

  const handleClick = (id) => {
    router.push(`/rooms/${id}`); 
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentRooms = rooms.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 4,
          xxl: 4,
        }}
        dataSource={currentRooms}
        renderItem={(room) => (
          <List.Item key={room.id}>
            <Card
              hoverable
              cover={
                <img
                  alt={room.tenPhong}
                  src={room.hinhAnh}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              }
              onClick={() => handleClick(room.id)}
            >
              <Card.Meta
                title={room.tenPhong}
                description={`Giá: ${room.giaTien} VNĐ`}
              />
            </Card>
          </List.Item>
        )}
      />

      <div className="flex justify-center mt-8">
        <Pagination
          current={currentPage}
          total={rooms.length}
          pageSize={ITEMS_PER_PAGE}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default LocationList;
