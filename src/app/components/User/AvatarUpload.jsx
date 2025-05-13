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
    setFileList([file]);
    return false; // Ngăn upload tự động
  };

  const handleUpload = async (options) => {
    const { file } = options;
    const formData = new FormData();
    formData.append("formFile", file);
    formData.append("id", userProfile.id);

    setUploading(true);
    try {
      console.log("Uploading avatar for ID:", userProfile.id);
      console.log("File name:", file.name);
      const res = await http.post("/api/users/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload API response:", JSON.stringify(res.data, null, 2));
      if (res.data.statusCode === 200) {
        const avatarUrl = res.data.content.avatar || res.data.content.url || ""; // Điều chỉnh dựa trên response
        const updatedProfile = { ...userProfile, avatar: avatarUrl };
        setUserProfile(updatedProfile);
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
        message.success("Tải lên avatar thành công!");
        setFileList([]);
        // Gọi lại API để lấy dữ liệu mới
        if (refreshProfile) refreshProfile();
      } else {
        message.error("Tải lên avatar thất bại.");
      }
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      message.error(
        `Tải lên avatar thất bại: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setUploading(false);
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
