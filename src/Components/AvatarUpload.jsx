// src/components/AvatarUpload.jsx

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "../api/users";
import { useAuth } from "../context/AuthContext";

const AvatarUpload = () => {
  const { user, updateUser } = useAuth();
  const [preview, setPreview] = useState(user?.avatar);

  const { mutate } = useMutation(updateProfile, {
    onSuccess: (data) => {
      updateUser(data.user);
      setPreview(data.user.avatar);
    },
  });

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("avatar", file);
    mutate(formData);
  };

  return (
    <div className="avatar-upload">
      <label>
        <input type="file" accept="image/*" onChange={handleChange} hidden />
        <img
          src={preview || "/default-avatar.png"}
          alt="Avatar"
          className="w-32 h-32 rounded-full cursor-pointer"
        />
      </label>
    </div>
  );
};

export default AvatarUpload;
