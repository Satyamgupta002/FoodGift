import React, { useState, useEffect } from "react";
import axios from "../../config/axiosConfig.js";
import {
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  Trophy,
  Clock,
  LogOut,
  User,
  MapPin,
  Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculateDistance, formatDistance } from "../../utils/distanceCalculator.js";

const Sidebar = ({ isOpen, toggleSidebar, activeTab, setActiveTab, requestCount }) => {
  const navigate = useNavigate(); 

  const handleLogout = () => {
    if (localStorage.getItem("token")) localStorage.removeItem("token");
    navigate("/"); 
    //console.log("User logged out");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "requests", label: "Requests", icon: ClipboardList },
    { id: "profile", label: "Profile", icon: User },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "history", label: "Pickups", icon: Clock },
  ];

  return (
    <div
      className={`bg-green-700 text-white h-screen fixed left-0 top-0 z-50 transition-all duration-300 ${
        isOpen ? "w-56" : "w-20"
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute right-4 top-4 p-2 hover:bg-green-600 rounded-full"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="pt-16 px-4">
        <h2 className={`text-2xl font-bold mb-8 ${!isOpen && "hidden"}`}>
          FoodGift
        </h2>
        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-lg mb-2 transition-colors
                  ${
                    activeTab === item.id
                      ? "bg-green-600"
                      : "hover:bg-green-600"
                  }`}
              >
                <Icon size={24} />
                <span className={!isOpen ? "hidden" : "flex items-center justify-between w-full"}>
                  {item.label}
                  {item.id === "requests" && requestCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                      {requestCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className={`px-4 ${!isOpen && "hidden"}`} >
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-4 p-3 rounded-lg mb-2 transition-colors
                bg-green-700  hover:bg-green-600
                  }`}
            >
              <LogOut size={24} />
              <span className="text-sm font-medium">Logout</span>
            </button>
      </div>
    </div>
  );
};

// Content Components
// const Dashboard = () => (
//   <div className="grid grid-cols-2 gap-6">
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h3 className="text-xl font-semibold mb-2">Total Donations</h3>
//       <p className="text-4xl font-bold text-green-600">₹1,234,567</p>
//     </div>
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h3 className="text-xl font-semibold mb-2">Total Donors</h3>
//       <p className="text-4xl font-bold text-green-600">1,234</p>
//     </div>
//   </div>
// );

const Dashboard = () => {
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);
  const [profile, setProfile] = useState({ name: "", email: "" });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming token is stored here
        const reqRes = await axios.get(
          "/api/receiver/total-requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const donorRes = await axios.get(
          "/api/receiver/total-donors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // const profileRes = await axios.get('/api/receiver/profile', {
        //   headers: {
        //     Authorization: `Bearer ${token}`
        //   }
        // });

        setTotalRequests(reqRes.data.totalRequests);
        setTotalDonors(donorRes.data.totalDonors);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Total Donations</h3>
        <p className="text-4xl font-bold text-green-600">{totalRequests}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Total Donors</h3>
        <p className="text-4xl font-bold text-green-600">{totalDonors} </p>
      </div>
    </div>
  );
};

const Requests = ({ requests, setRequests, setRequestCount, loading }) => {
  const [receiverLocation, setReceiverLocation] = useState(null);

  useEffect(() => {
    const fetchReceiverLocation = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/receiver/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setReceiverLocation(response.data.receiver?.location || null);
      } catch (error) {
        console.error("Error fetching receiver location:", error);
      }
    };

    fetchReceiverLocation();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/receiver/accept-request/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the request in state to show as accepted instead of removing it
      if (response.data.success && response.data.updatedRequest) {
        setRequests((prev) =>
          prev.map((req) =>
            req._id === requestId
              ? { ...req, status: "accepted", acceptedBy: response.data.updatedRequest.acceptedBy }
              : req
          )
        );
      }
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const getDistanceLabel = (donorLocation) => {
    if (!receiverLocation || !donorLocation) {
      return "Distance not available";
    }

    const lat1 = parseFloat(receiverLocation.latitude || receiverLocation.lattitude);
    const lon1 = parseFloat(receiverLocation.longitude);
    const lat2 = parseFloat(donorLocation.latitude || donorLocation.lattitude);
    const lon2 = parseFloat(donorLocation.longitude);

    if ([lat1, lon1, lat2, lon2].some((value) => Number.isNaN(value))) {
      return "Distance not available";
    }

    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    return formatDistance(distance);
  };

  if (loading) return <p className="p-4 text-gray-500">Loading requests...</p>;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
          <div>
            <h3 className="text-xl font-semibold mb-2">Recent Donation Requests</h3>
            <p className="text-gray-600">Total Requests: {requests.length}</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <p className="text-gray-500">No requests available.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req, index) => {
              const isAcceptedByCurrentReceiver = req.status === 'accepted' && req.acceptedBy;
              if (req.status === 'pending' || isAcceptedByCurrentReceiver) {
                const donationTypeLabel = {
                  food: 'Food',
                  clothes: 'Clothes',
                  toys: 'Toys',
                  books: 'Books',
                }[req.donationType] || 'Donation';

                const donationDetails = [];
                if (req.donationType === 'food') {
                  donationDetails.push(
                    { label: 'Food Type', value: req.foodType || 'Cooked Meals' },
                    { label: 'Servings', value: req.approxPeople || 'N/A' }
                  );
                } else if (req.donationType === 'clothes') {
                  donationDetails.push(
                    { label: 'Clothes Type', value: req.clothesType || 'Mixed' },
                    { label: 'Size', value: req.size || 'Mixed Sizes' },
                    { label: 'Condition', value: req.condition || 'Good' },
                    { label: 'Quantity', value: req.quantity ?? 'N/A' }
                  );
                } else if (req.donationType === 'toys') {
                  donationDetails.push(
                    { label: 'Age Group', value: req.ageGroup || 'All Ages' },
                    { label: 'Condition', value: req.condition || 'Good' },
                    { label: 'Quantity', value: req.quantity ?? 'N/A' }
                  );
                } else if (req.donationType === 'books') {
                  donationDetails.push(
                    { label: 'Title', value: req.title || 'Mixed Books' },
                    { label: 'Author', value: req.author || 'Various' },
                    { label: 'Quantity', value: req.quantity ?? 'N/A' },
                    { label: 'Condition', value: req.condition || 'Good' }
                  );
                }

                const formattedExpiry = req.expiryTime
                  ? new Date(req.expiryTime).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })
                  : 'N/A';

                return (
                  <div key={req._id || index} className="border-b pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4">
                        <img
                          src={req.imageUrl || `https://picsum.photos/100?random=${index + 1}`}
                          className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                          alt={`${donationTypeLabel} donation`}
                        />
                        <div>
                          <h4 className="font-semibold text-lg">
                            {req.donor?.name || `Donor ${index + 1}`}
                          </h4>
                          <p className="text-gray-600">
                            <span className="font-semibold">Contact: </span>
                            {req.donor?.phoneNumber ? (
                              <a href={`tel:${req.donor.phoneNumber}`} className="text-green-600 underline">
                                {req.donor.phoneNumber}
                              </a>
                            ) : (
                              'N/A'
                            )}
                          </p>
                          <p className="text-gray-600 mt-2">
                            <span className="font-semibold">Donation Type: </span>
                            {donationTypeLabel}
                          </p>
                          <div className="space-y-1 mt-2">
                            {donationDetails.map((detail, detailIndex) => (
                              <p key={detailIndex} className="text-gray-600">
                                <span className="font-semibold">{detail.label}: </span>
                                {detail.value}
                              </p>
                            ))}
                            <p className="text-gray-600">
                              <span className="font-semibold">Distance: </span>
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                <MapPin size={14} />
                                {getDistanceLabel(req.location)}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              <span className="font-semibold">Expiry: </span>
                              {formattedExpiry}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-semibold">Address: </span>
                              {req.location?.address || 'Unknown address'}
                            </p>
                          </div>
                        </div>
                      </div>
                      {req.status === 'accepted' ? (
                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mt-2 font-medium">
                          Accepted by you
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAccept(req._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mt-2"
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// const Achievements = () => (
//   <div className="bg-white rounded-lg shadow-md p-6">
//     <h3 className="text-xl font-semibold mb-4">NGO Achievements</h3>
//     <div className="space-y-6">
//       <div className="border-l-4 border-green-600 pl-4">
//         <h4 className="font-semibold">100,000 Meals Served</h4>
//         <p className="text-gray-600">Reached milestone in December 2023</p>
//       </div>
//       <div className="border-l-4 border-green-600 pl-4">
//         <h4 className="font-semibold">Community Impact Award</h4>
//         <p className="text-gray-600">Received in October 2023</p>
//       </div>
//       <div className="border-l-4 border-green-600 pl-4">
//         <h4 className="font-semibold">Zero Food Waste Initiative</h4>
//         <p className="text-gray-600">Successfully implemented in 50 locations</p>
//       </div>
//     </div>
//   </div>
// );

const Achievements = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [achievements, setAchievements] = useState([
    {
      title: "100,000 Meals Served",
      description: "Reached milestone in December 2023",
    },
    {
      title: "Community Impact Award",
      description: "Received in October 2023",
    },
    {
      title: "Zero Food Waste Initiative",
      description: "Successfully implemented in 50 locations",
    },
  ]);

  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
  });

  const handleAddAchievement = () => {
    if (newAchievement.title && newAchievement.description) {
      setAchievements([...achievements, newAchievement]);
      setNewAchievement({ title: "", description: "" });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">NGO Achievements</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Achievement
        </button>
      </div>

      <div className="space-y-6">
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className="border-l-4 border-green-600 pl-4 flex items-start gap-3"
          >
            <div className="bg-green-100 p-2 rounded-full">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                {achievement.title}
              </h4>
              <p className="text-gray-600 mt-1">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Achievement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAchievement}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Achievement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/receiver/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data.receiver);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="text-gray-600">Loading profile...</p>;
  if (!profile) return <p className="text-gray-600">Profile not found.</p>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold">Organization Profile</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {isEditing ? (
        <EditProfileForm profile={profile} setProfile={setProfile} setIsEditing={setIsEditing} />
      ) : (
        <div className="space-y-4">
          <div className="border-b pb-4">
            <p className="text-gray-600 text-sm">Organization Name</p>
            <p className="text-2xl font-semibold text-gray-900">{profile.organizationName}</p>
          </div>
          <div className="border-b pb-4">
            <p className="text-gray-600 text-sm">Contact Person</p>
            <p className="text-lg font-medium text-gray-900">{profile.name}</p>
          </div>
          <div className="border-b pb-4">
            <p className="text-gray-600 text-sm">Email</p>
            <p className="text-lg font-medium text-gray-900">{profile.email}</p>
          </div>
          <div className="border-b pb-4">
            <p className="text-gray-600 text-sm">Phone Number</p>
            <p className="text-lg font-medium text-gray-900">{profile.phoneNumber}</p>
          </div>
          <div className="pb-4">
            <p className="text-gray-600 text-sm">Address</p>
            <p className="text-lg font-medium text-gray-900">{profile.location?.address}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const EditProfileForm = ({ profile, setProfile, setIsEditing }) => {
  const [formData, setFormData] = useState({
    organizationName: profile.organizationName,
    name: profile.name,
    phoneNumber: profile.phoneNumber,
    address: profile.location?.address,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "/api/receiver/edit-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfile(response.data.receiver);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name
        </label>
        <input
          type="text"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Person Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

const PickupHistory = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPickupHistory = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming token is stored here
        const response = await axios.get(
          "/api/receiver/pickup-history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPickups(response.data.pickups);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching pickup history:", err);
        if (err.response) {
          console.error("Server responded with:", err.response.data);
        } else if (err.request) {
          console.error("No response received:", err.request);
        } else {
          console.error("Error setting up request:", err.message);
        }
        setLoading(false);
      }
    };

    fetchPickupHistory();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Pickup History</h3>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : pickups.length === 0 ? (
        <p className="text-gray-600">No pickups found.</p>
      ) : (
        <div className="space-y-4">
          {pickups.map((pickup, index) => {
            const request = pickup?.request || {};
            const donationType = request.donationType || "unknown";
            const donorContact = pickup?.donor?.phoneNumber || pickup?.donor?.email || "N/A";
            let donationQuantityLabel = "";

            if (donationType === "food") {
              donationQuantityLabel = `${request.approxPeople ?? "?"} meals`;
            } else if (donationType === "clothes") {
              donationQuantityLabel = `${request.quantity ?? "?"} items`;
            } else if (donationType === "toys") {
              donationQuantityLabel = `${request.quantity ?? "?"} toys`;
            } else if (donationType === "books") {
              donationQuantityLabel = `${request.quantity ?? "?"} books`;
            } else {
              donationQuantityLabel = `${request.quantity ?? request.approxPeople ?? "?"} items`;
            }

            const donationTypeLabel = donationType
              .split(" ")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" ");

            return (
              <div
                key={pickup._id || index}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <h4 className="font-semibold">Pickup #{index + 1}</h4>
                  <p className="text-gray-600">
                    From: {pickup?.donor?.name || "Donor"}
                  </p>
                  <p className="text-gray-600">Contact: {donorContact}</p>
                  <p className="text-sm text-gray-500">
                    Date:{" "}
                    {new Date(
                      pickup.createdAt || pickup?.request?.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{donationTypeLabel}</p>
                  <p className="text-gray-600">{donationQuantityLabel}</p>
                  <p className="text-green-600 capitalize">{pickup.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// NotificationPanel Component
const NotificationPanel = ({ isOpen, onClose, notifications }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-96 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No notifications</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="border-l-4 border-green-600 pl-4 py-3 bg-green-50 rounded hover:bg-green-100 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Header Component with Notification Bell
const Header = ({ notificationCount, onBellClick }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="flex justify-end items-center p-4 pr-8">
        <button
          onClick={onBellClick}
          className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell size={24} />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
              {notificationCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

function ReceiverDashbaord() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [requestCount, setRequestCount] = useState(0);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchReceiverRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/receiver/requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const pendingRequests = res.data.data || [];
        setRequests(pendingRequests);
        setRequestCount(pendingRequests.length);
      } catch (error) {
        console.error("Error loading receiver requests:", error);
      } finally {
        setRequestsLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/receiver/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications(response.data.notifications || []);
      } catch (error) {
        console.error("Error fetching receiver notifications:", error);
      }
    };

    fetchReceiverRequests();
    fetchNotifications();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "requests":
        return (
          <Requests
            requests={requests}
            setRequests={setRequests}
            setRequestCount={setRequestCount}
            loading={requestsLoading}
          />
        );
      case "profile":
        return <Profile />;
      case "achievements":
        return <Achievements />;
      case "history":
        return <PickupHistory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        requestCount={requestCount}
      />
      <Header
        notificationCount={notifications.length}
        onBellClick={() => setNotificationPanelOpen(true)}
      />
      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={async () => {
          setNotificationPanelOpen(false);
          setNotifications([]);
          
          // Delete notifications from backend
          try {
            const token = localStorage.getItem("token");
            await axios.delete("/api/receiver/notifications", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          } catch (error) {
            console.error("Error clearing notifications:", error);
          }
        }}
        notifications={notifications}
      />
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-56" : "ml-20"
        } p-8 bg-gray-100 min-h-[calc(100vh-60px)]`}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default ReceiverDashbaord;
