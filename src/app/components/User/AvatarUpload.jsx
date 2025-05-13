"use client";

import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { http } from "app/utils/setting";

const AvatarUpload = ({ userProfile, setUserProfile, refreshProfile }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ chấp nhận file hình ảnh!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Hình ảnh phải nhỏ hơn 2MB!");
      return false;
    }

    console.log("Selected file:", file); // Kiểm tra file đã được chọn
    setFileList([file]); // Chỉ cần cập nhật file list
    return false; // Ngăn upload mặc định và thực hiện customRequest
  };
  

  const handleUpload = async (options) => {
    console.log("Custom request triggered", options); // Xem options có được truyền vào không

    const { file } = options;
    console.log("File to upload:", file); // Kiểm tra file

    const formData = new FormData();
    formData.append("formFile", file);
    formData.append("id", userProfile.id);

    console.log("Form data prepared:", formData);

    setUploading(true);
    try {
      const res = await http.post("/api/users/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("API response:", res); // Kiểm tra phản hồi API
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
    } finally {
      setUploading(false);
      console.log("Upload process finished.");
    }
  };
  
  

  return (
    <Upload
      beforeUpload={handleBeforeUpload}
      customRequest={handleUpload}
      fileList={fileList}
      onRemove={() => setFileList([])}
      maxCount={1}
      showUploadList={false} // Tắt hiển thị danh sách file
    >
      <Button
        icon={<UploadOutlined />}
        loading={uploading}
        style={{
          marginTop: "10px",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Tải lên avatar
      </Button>
    </Upload>
  );
};

export default AvatarUpload;
