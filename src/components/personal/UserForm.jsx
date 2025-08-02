"use client";
import React, { useState } from "react";
import fetchWithAuth from "../../lib/fetchWithAuth";
  import { ToastContainer, toast } from 'react-toastify';
export default function UserForm({ data ,onUpdateSuccess}) {
  const [changePass, setChangePass] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_URL;

    
    

  const [formData, setFormData] = useState({
    _id: data._id,
    name: data.name || "",
    phoneCountry: "Bangladesh",
    phone: data.phone || "",
    city: data.city || "",
    email: data.email || "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (changePass && formData.newPassword !== formData.confirmPassword) {
    toast.error("Passwords are not matching");
    return;
  }

  // Build object with only changed fields
  const changedFields = {};

  if (formData.name !== data.name) changedFields.name = formData.name;
  if (formData.phone !== data.phone) changedFields.phone = formData.phone;
  if (formData.phoneCountry !== (data.phoneCountry || "Bangladesh")) changedFields.phoneCountry = formData.phoneCountry;
  if (formData.city !== data.city) changedFields.city = formData.city;
  if (formData.email !== data.email) changedFields.email = formData.email;

  

  if (changePass && formData.newPassword) {
    changedFields.password = formData.newPassword;
  }

  // If nothing changed, show info toast and exit
  if (Object.keys(changedFields).length === 0) {
    toast.info("No changes detected.");
    return;
  }

  changedFields._id = formData._id; // Always include _id

  try {
    const response = await fetchWithAuth(`${baseUrl}/user/update-user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(changedFields),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    toast.success("Updated successfully");
    toast.success("Profile updated successfully!");

    // Reset password fields
    setFormData((prev) => ({
      ...prev,
      newPassword: "",
      confirmPassword: "",
    }));
    setChangePass(false);
  } catch (error) {
    console.error("Update failed:", error);
    toast.error("Update failed. Please try again.");
  }
   
  if (onUpdateSuccess) {
    e.preventDefault()
    toast.success("Updated successfully");
  await onUpdateSuccess();
  
}
};



  return (
    <div>
      <div className="border-2 border-[#C38ABA]"></div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-6 mt-10 md:mx-15">
          {/* Name */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label
              htmlFor="name"
              className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0"
            >
              Name
            </label>
            <div className="flex-1">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 bg-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
                placeholder="Your name"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label
              htmlFor="phone"
              className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0"
            >
              Phone
            </label>
            <div className="flex-1 flex gap-2">
              <select
                id="phoneCountry"
                name="phoneCountry"
                value={formData.phoneCountry}
                onChange={handleChange}
                className="w-1/4 bg-slate-100 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value="BD">+880</option>
                <option value="USA">+1</option>
                <option value="IN">+91</option>
              </select>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border bg-slate-100 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              />
            </div>
          </div>

          {/* City */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label
              htmlFor="city"
              className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0"
            >
              City
            </label>
            <div className="flex-1">
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border bg-slate-100 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
                placeholder="City"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label
              htmlFor="email"
              className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0"
            >
              Email
            </label>
            <div className="flex-1">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border bg-slate-100 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                readOnly
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label
              htmlFor="email"
              className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0"
            >
              Password
            </label>
            <div>
              {!changePass ? (
                <button
                  className="bg-[#7D0000] text-white rounded p-2 px-3"
                  onClick={() => setChangePass(true)}
                >
                  Change Password
                </button>
              ) : (
                <div className="grid gap-2 md:flex md:gap-5 text-black w-full">
                  <input
                    type="password"
                    id="new-password"
                    name="newPassword"
                    placeholder="New Password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full border bg-slate-100 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full border bg-slate-100 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                  <button
                    className="bg-[#7D0000] text-white rounded p-2 px-3"
                    onClick={() => {
                      setChangePass(false);
                      setFormData((prev) => ({
                        ...prev,
                        newPassword: "",
                        confirmPassword: "",
                      }));
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-gradient-to-r from-[#D80000] to-[#720000] p-3 font-medium px-15 rounded-full text-white float-end"
          >
            Update Profile
          </button>
        </form>
      </div>
        <ToastContainer />
    </div>
  );
}
