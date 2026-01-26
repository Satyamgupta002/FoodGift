import React, { useState } from "react";
import axios from "../../config/axiosConfig.js";

const DonorPage = () => {
  const [formData, setFormData] = useState({
    foodType: "Cooked",
    people: "",
    location: "",
    expiry: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please login first");
        return;
      }

      const payload = {
        foodType: formData.foodType,
        approxPeople: parseInt(formData.people),
        location: formData.location,
        expiryTime: formData.expiry,
        imageUrl: " ", // Simple string for now
      };

      console.log("Submitting:", payload);

      const res = await axios.post(
        "/api/donor/donor-request",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Success:", res.data);
      alert("Donation request created successfully!");
      
      // Reset form
      setFormData({
        foodType: "Cooked",
        people: "",
        location: "",
        expiry: "",
        image: null,
      });
      
    } catch (error) {
      console.error("Error:", error);
      
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Failed to submit donation. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-green-900 mb-8">Donate Food</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Food Type */}
        <div>
          <label className="block text-sm font-semibold text-green-800 mb-2">
            Food Type
          </label>
          <select
            value={formData.foodType}
            onChange={(e) => handleChange('foodType', e.target.value)}
            className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          >
            <option value="Cooked">Cooked</option>
            <option value="Dry">Dry</option>
            <option value="Fresh">Fresh</option>
          </select>
        </div>

        {/* Approx People to Serve */}
        <div>
          <label className="block text-sm font-semibold text-green-800 mb-2">
            Approx. People to be Served
          </label>
          <input
            type="number"
            value={formData.people}
            onChange={(e) => handleChange('people', e.target.value)}
            className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            placeholder="e.g. 50"
            min="1"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-green-800 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            placeholder="Enter pickup address"
            required
          />
        </div>

        {/* Expiry Time */}
        <div>
          <label className="block text-sm font-semibold text-green-800 mb-2">
            Expiry Time (Approx)
          </label>
          <input
            type="datetime-local"
            value={formData.expiry}
            onChange={(e) => handleChange('expiry', e.target.value)}
            className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            required
          />
        </div>

        {/* Image Upload - Disabled for now */}
        <div>
          <label className="block text-sm font-semibold text-green-800 mb-2">
            Upload Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleChange('image', e.target.files[0])}
            className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-green-800 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transform transition-all shadow-lg ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Donation'}
        </button>
      </form>
    </div>
  );
};

export default DonorPage;