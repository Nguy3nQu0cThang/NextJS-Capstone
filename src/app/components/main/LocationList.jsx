"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllLocations } from "app/services/bookingService";
import { List, Card, Pagination } from "antd";
const ITEMS_PER_PAGE = 8; // số lượng địa điểm mỗi trang

const LocationList = () => {
  const [locations, setLocations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await getAllLocations();
        console.log("DATA RESPONSE:", res);
        setLocations(res?.content || []); // <-- dùng res.content
      } catch (error) {
        console.error("Lỗi khi lấy danh sách vị trí:", error);
      }
    };
  
    fetchLocations();
  }, []);

  const handleClick = (id) => {
    router.push(`/rooms/${id}`);
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentLocations = locations.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(locations.length / ITEMS_PER_PAGE);

  

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
        dataSource={currentLocations}
        renderItem={(location) => (
          <List.Item>
            <Card
              hoverable
              cover={
                <img
                  alt={location.tenViTri}
                  src={location.hinhAnh}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              }
              onClick={() => handleClick(location.id)}
            >
              <Card.Meta
                title={location.tenViTri}
                description={location.tinhThanh}
              />
            </Card>
          </List.Item>
        )}
      />

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <Pagination
          current={currentPage}
          total={locations.length}
          pageSize={ITEMS_PER_PAGE}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default LocationList;
