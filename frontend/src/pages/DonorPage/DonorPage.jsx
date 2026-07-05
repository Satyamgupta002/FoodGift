import React, { useState } from "react";
import axios from "../../config/axiosConfig.js";
import { indianStates, citiesByState } from "./indianLocations.js";

const DonorPage = () => {
  const [donationType, setDonationType] = useState("food");
  
  const [foodFormData, setFoodFormData] = useState({
    foodType: "Cooked",
    people: "",
    localAddress: "",
    city: "",
    state: "",
    expiry: "",
    image: null,
  });

  const [clothesFormData, setClothesFormData] = useState({
    clothesType: "Shirts",
    size: "M",
    condition: "New",
    quantity: "",
    localAddress: "",
    city: "",
    state: "",
    expiry: "",
  });

  const [toysFormData, setToysFormData] = useState({
    condition: "Good",
    ageGroup: "3-5",
    quantity: "",
    localAddress: "",
    city: "",
    state: "",
    expiry: "",
  });

  const [booksFormData, setBooksFormData] = useState({
    title: "",
    author: "",
    quantity: "",
    condition: "Good",
    localAddress: "",
    city: "",
    state: "",
    expiry: "",
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("");
    setStatusType("");

    try {
      const formData = new FormData();

      if (donationType === "food") {
        formData.append("donationType", "food");
        formData.append("foodType", foodFormData.foodType);
        formData.append("approxPeople", parseInt(foodFormData.people, 10));
        formData.append("location", `${foodFormData.localAddress}, ${foodFormData.city}, ${foodFormData.state}, India`);
        formData.append("expiryTime", foodFormData.expiry);
        if (foodFormData.image) {
          formData.append("image", foodFormData.image);
        }
      } else if (donationType === "clothes") {
        formData.append("donationType", "clothes");
        formData.append("clothesType", clothesFormData.clothesType);
        formData.append("size", clothesFormData.size);
        formData.append("condition", clothesFormData.condition);
        formData.append("quantity", Number.parseInt(clothesFormData.quantity, 10) || 0);
        formData.append("location", `${clothesFormData.localAddress}, ${clothesFormData.city}, ${clothesFormData.state}, India`);
        formData.append("expiryTime", clothesFormData.expiry);
      } else if (donationType === "toys") {
        formData.append("donationType", "toys");
        formData.append("condition", toysFormData.condition);
        formData.append("ageGroup", toysFormData.ageGroup);
        formData.append("quantity", Number.parseInt(toysFormData.quantity, 10) || 0);
        formData.append("location", `${toysFormData.localAddress}, ${toysFormData.city}, ${toysFormData.state}, India`);
        formData.append("expiryTime", toysFormData.expiry);
      } else if (donationType === "books") {
        formData.append("donationType", "books");
        formData.append("title", booksFormData.title);
        formData.append("author", booksFormData.author);
        formData.append("quantity", Number.parseInt(booksFormData.quantity, 10) || 0);
        formData.append("condition", booksFormData.condition);
        formData.append("location", `${booksFormData.localAddress}, ${booksFormData.city}, ${booksFormData.state}, India`);
        formData.append("expiryTime", booksFormData.expiry);
      }

      console.log("Submitting with FormData");

      const res = await axios.post(
        "/api/donor/donor-request",
        formData
      );

      console.log("Success:", res.data);
      setStatusType("success");
      setStatusMessage("Donation submitted successfully! Your donation request has been shared with nearby NGOs.");
      
      // Reset form based on donation type
      if (donationType === "food") {
        setFoodFormData({
          foodType: "Cooked",
          people: "",
          localAddress: "",
          city: "",
          state: "",
          expiry: "",
          image: null,
        });
      } else if (donationType === "clothes") {
        setClothesFormData({
          clothesType: "Shirts",
          size: "M",
          condition: "New",
          quantity: "",
          localAddress: "",
          city: "",
          state: "",
          expiry: "",
        });
      } else if (donationType === "toys") {
        setToysFormData({
          condition: "Good",
          ageGroup: "3-5",
          quantity: "",
          localAddress: "",
          city: "",
          state: "",
          expiry: "",
        });
      } else if (donationType === "books") {
        setBooksFormData({
          title: "",
          author: "",
          quantity: "",
          condition: "Good",
          localAddress: "",
          city: "",
          state: "",
          expiry: "",
        });
      }
      
    } catch (error) {
      console.error("Error:", error);
      setStatusType("error");
      if (error.response?.data?.message) {
        setStatusMessage(error.response.data.message);
      } else {
        setStatusMessage("Failed to submit donation. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (donationType === "food") {
      setFoodFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (donationType === "clothes") {
      setClothesFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (donationType === "toys") {
      setToysFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (donationType === "books") {
      setBooksFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-green-900 mb-8">Make a Donation</h2>
      {statusMessage && (
        <div
          className={`mb-6 rounded-2xl border p-4 shadow-sm ${
            statusType === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${
                statusType === "success"
                  ? "bg-green-600 animate-pulse"
                  : "bg-red-600"
              }`}
            >
              {statusType === "success" ? "✓" : "!"}
            </div>
            <div>
              <p
                className={`font-semibold ${
                  statusType === "success"
                    ? "text-green-900"
                    : "text-red-900"
                }`}
              >
                {statusType === "success"
                  ? "Donation Submit Successful"
                  : "Submission Error"}
              </p>
              <p className="text-sm text-gray-700">{statusMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Donation Type Selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-green-800 mb-3">
          What would you like to donate?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: "food", label: "🍲 Food", emoji: "🍲" },
            { value: "clothes", label: "👕 Clothes", emoji: "👕" },
            { value: "toys", label: "🧸 Toys", emoji: "🧸" },
            { value: "books", label: "📚 Books", emoji: "📚" },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setDonationType(type.value)}
              className={`py-3 px-4 rounded-lg font-semibold transition-all border-2 ${
                donationType === type.value
                  ? "bg-green-600 text-white border-green-600 shadow-lg scale-105"
                  : "bg-white text-green-800 border-green-300 hover:border-green-600"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* FOOD DONATION FORM */}
        {donationType === "food" && (
          <>
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-2">
                Food Type
              </label>
              <select
                value={foodFormData.foodType}
                onChange={(e) => handleChange('foodType', e.target.value)}
                className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              >
                <option value="Cooked">Cooked</option>
                <option value="Dry">Dry</option>
                <option value="Fresh">Fresh</option>
                <option value="Frozen">Frozen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-800 mb-2">
                Approx. People to be Served
              </label>
              <input
                type="number"
                value={foodFormData.people}
                onChange={(e) => handleChange('people', e.target.value)}
                className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="e.g. 50"
                min="1"
                required
              />
            </div>

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
          </>
        )}

        {/* CLOTHES DONATION FORM */}
        {donationType === "clothes" && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Clothes Type
                </label>
                <select
                  name="clothesType"
                  value={clothesFormData.clothesType}
                  onChange={(e) => handleChange('clothesType', e.target.value)}
                  className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  <option value="Shirts">Shirts</option>
                  <option value="Pants">Pants</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Jackets">Jackets</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Size
                </label>
                <select
                  name="size"
                  value={clothesFormData.size}
                  onChange={(e) => handleChange('size', e.target.value)}
                  className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  <option value="XS">Extra Small</option>
                  <option value="S">Small</option>
                  <option value="M">Medium</option>
                  <option value="L">Large</option>
                  <option value="XL">Extra Large</option>
                  <option value="Mixed">Mixed Sizes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Condition
                </label>
                <select
                  name="condition"
                  value={clothesFormData.condition}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Quantity
                </label>
                <input
                  name="quantity"
                  type="number"
                  value={clothesFormData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="Number of items"
                  min="1"
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* TOYS DONATION FORM */}
        {donationType === "toys" && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Condition
                </label>
                <select
                  name="condition"
                  value={toysFormData.condition}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Age Group
                </label>
                <select
                  name="ageGroup"
                  value={toysFormData.ageGroup}
                  onChange={(e) => handleChange('ageGroup', e.target.value)}
                  className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-8">6-8 years</option>
                  <option value="9-12">9-12 years</option>
                  <option value="13+">13+ years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-800 mb-2">
                Quantity
              </label>
              <input
                name="quantity"
                type="number"
                value={toysFormData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="Number of toys"
                min="1"
                required
              />
            </div>
          </>
        )}

        {/* BOOKS DONATION FORM */}
        {donationType === "books" && (
          <>
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-2">
                Book Title
              </label>
              <input
                name="title"
                type="text"
                value={booksFormData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="Enter book title (or 'Mixed' for multiple)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-800 mb-2">
                Author
              </label>
              <input
                name="author"
                type="text"
                value={booksFormData.author}
                onChange={(e) => handleChange('author', e.target.value)}
                className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="Enter author name (or 'Various' for multiple)"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Quantity
                </label>
                <input
                  name="quantity"
                  type="number"
                  value={booksFormData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="Number of books"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Condition
                </label>
                <select
                  name="condition"
                  value={booksFormData.condition}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Common Fields for All Donations */}
        <div>
          <label className="block text-sm font-semibold text-green-800 mb-2">
            Pickup Location
          </label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              type="text"
              value={
                donationType === "food" ? foodFormData.localAddress :
                donationType === "clothes" ? clothesFormData.localAddress :
                donationType === "toys" ? toysFormData.localAddress :
                booksFormData.localAddress
              }
              onChange={(e) => handleChange('localAddress', e.target.value)}
              className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="Local address"
              required
            />
            <div>
              <select
                value={
                  donationType === "food" ? foodFormData.state :
                  donationType === "clothes" ? clothesFormData.state :
                  donationType === "toys" ? toysFormData.state :
                  booksFormData.state
                }
                onChange={(e) => {
                  handleChange('state', e.target.value);
                  handleChange('city', '');
                }}
                className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                required
              >
                <option value="">Select State</option>
                {indianStates.map((stateOption) => (
                  <option key={stateOption.value} value={stateOption.value}>
                    {stateOption.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={
                  donationType === "food" ? foodFormData.city :
                  donationType === "clothes" ? clothesFormData.city :
                  donationType === "toys" ? toysFormData.city :
                  booksFormData.city
                }
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                required
                disabled={
                  !(
                    donationType === "food" ? foodFormData.state :
                    donationType === "clothes" ? clothesFormData.state :
                    donationType === "toys" ? toysFormData.state :
                    booksFormData.state
                  )
                }
              >
                <option value="">Select City</option>
                {
                  (
                    citiesByState[
                      donationType === "food" ? foodFormData.state :
                      donationType === "clothes" ? clothesFormData.state :
                      donationType === "toys" ? toysFormData.state :
                      booksFormData.state
                    ] || []
                  ).map((cityOption) => (
                    <option key={cityOption} value={cityOption}>
                      {cityOption}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>
         
        </div>

        <div>
          <label className="block text-sm font-semibold text-green-800 mb-2">
            Available Until (Approx)
          </label>
          <input
            type="datetime-local"
            value={
              donationType === "food" ? foodFormData.expiry :
              donationType === "clothes" ? clothesFormData.expiry :
              donationType === "toys" ? toysFormData.expiry :
              booksFormData.expiry
            }
            onChange={(e) => handleChange('expiry', e.target.value)}
            className="w-full rounded-lg border-2 border-green-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            required
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