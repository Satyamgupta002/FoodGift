import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Mail, Lock, Phone, User, Crown, AlertCircle } from "lucide-react";
import axios from "../../config/axiosConfig.js";
import { indianStates, citiesByState } from "../DonorPage/indianLocations.js";
import { isValidEmail, isValidPhone, getEmailError, getPhoneError } from "../../utils/validation.js";

function DonorRegister() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitError("");
    
    // Validate email
    if (!isValidEmail(email)) {
      setEmailError(getEmailError(email));
      return;
    }
    setEmailError("");
    
    // Validate phone
    if (!isValidPhone(phone)) {
      setPhoneError(getPhoneError(phone));
      return;
    }
    setPhoneError("");
    
    // Validate address fields
    if (!localAddress.trim() || !state || !city) {
      setSubmitError("Please fill in all address fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress = `${localAddress}, ${city}, ${state}, India`;
      const response = await axios.post(
        "/api/auth/register",
        {
          name,
          phoneNumber: phone,
          email,
          password,
          location: fullAddress,
          role: "donor",
        }
      );

      console.log("Registration successful:", response.data);
      navigate("/donorLogin");
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );
      setSubmitError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-10">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-8 h-8 text-green-600" />
          <div>
            <span className="text-3xl font-bold text-gray-900">
              Welcome, Changemaker!
            </span>
            <p className="text-sm text-gray-600 mt-1">
              You wear the crown of kindness. Let's make the world better, one
              step at a time.
            </p>
          </div>
        </div>
        <form onSubmit={handleRegister} className="space-y-6">
          {submitError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(getEmailError(e.target.value));
                  }}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                    emailError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {emailError && (
                <div className="mt-2 flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{emailError}</p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError(getPhoneError(e.target.value));
                  }}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                    phoneError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                  }`}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              {phoneError && (
                <div className="mt-2 flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{phoneError}</p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pickup Location
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={localAddress}
                  onChange={(e) => setLocalAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Local address"
                  required
                />
                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setCity('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select State</option>
                  {indianStates.map((stateOption) => (
                    <option key={stateOption.value} value={stateOption.value}>
                      {stateOption.label}
                    </option>
                  ))}
                </select>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={!state}
                >
                  <option value="">Select City</option>
                  {(citiesByState[state] || []).map((cityOption) => (
                    <option key={cityOption} value={cityOption}>
                      {cityOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/donorLogin")}
            className="text-green-600 hover:text-green-500 font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export default DonorRegister;
