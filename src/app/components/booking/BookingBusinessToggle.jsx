"use client";

import { Checkbox } from "antd";
import { useState } from "react";

const BookingBusinessToggle = () => {
  const [isWorkTrip, setIsWorkTrip] = useState(false);

  const handleChange = (e) => {
    setIsWorkTrip(e.target.checked);
    console.log("Có đi công tác?", e.target.checked);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 shadow-sm">
      <Checkbox checked={isWorkTrip} onChange={handleChange}>
        Tôi đang đi công tác
      </Checkbox>
    </div>
  );
};

export default BookingBusinessToggle;
