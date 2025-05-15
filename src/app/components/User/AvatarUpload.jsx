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

    console.log("Selected file:", file);
    setFileList([file]);

    // Gọi handleUpload trực tiếp để đảm bảo API được gọi
    handleUpload({ file, onSuccess: () => {}, onError: () => {} });
    return false; // Ngăn upload mặc định
  };

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    console.log("Custom request triggered with options:", options);
    console.log("File to upload:", file);

    const formData = new FormData();
    formData.append("formFile", file);
    formData.append("id", userProfile.id);

    console.log("Form data prepared:", Array.from(formData.entries()));

    setUploading(true);
    try {
      const res = await http.post("/api/users/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("API response:", res.data);

      if (res.data.statusCode === 200) {
        message.success("Tải lên avatar thành công!");
        setUserProfile((prev) => ({
          ...prev,
          avatar: res.data.content?.avatar,
        }));
        if (refreshProfile) refreshProfile();
        onSuccess();
      } else {
        throw new Error("Upload thất bại từ server!");
      }
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      message.error(
        "Tải lên thất bại: " + (err.response?.data?.content || err.message)
      );
      onError(err);
    } finally {
      setUploading(false);
      setFileList([]);
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
      showUploadList={false}
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
