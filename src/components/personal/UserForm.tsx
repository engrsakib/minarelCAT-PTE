import React, { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
  name: string;
  phoneCountry: string;
  phone: string;
  city: string;
  email: string;
}

export default function UserForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phoneCountry: "Bangladesh",
    phone: "",
    city: "",
    email: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form data:", formData);
  };

  return (
    <div>
      <div className="border-2 border-[#C38ABA]"></div>
      <div>
          <form onSubmit={handleSubmit} className="space-y-6 mt-10 mx-15">
            
            {/* --- Name Field --- */}
            {/* Each form row is a flex container for alignment */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              {/* Labels have a fixed width on larger screens for alignment */}
              <label htmlFor="name" className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0">
                Name
              </label>
              {/* The input field takes up the remaining space */}
              <div className="flex-1">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                  placeholder="Your name "
                />
              </div>
            </div>

            {/* --- Phone Number Field --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <label htmlFor="phone" className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0">
                Phone
              </label>
              {/* This container is also a flexbox to manage the select and input fields */}
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
                  placeholder="Phone Number "
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border bg-slate-100 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required

                />
              </div>
            </div>

            {/* --- City Field --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <label htmlFor="city" className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0">
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

            {/* --- Email Field --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <label htmlFor="email" className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0">
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
                  required
                />
              </div>
            </div>

            {/* --- Submit Button --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <label htmlFor="email" className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0">
                Password
              </label>
              <div className="flex-1">
                <button className="bg-[#7D0000] text-white rounded p-2 px-3">Change Password</button>
              </div>
            </div>

            <button className="bg-gradient-to-r from-[#D80000] to-[#720000] p-3 font-medium px-15 rounded-full text-white float-end">Update Profile</button>
          </form>
      </div>
    </div>
  );
}
