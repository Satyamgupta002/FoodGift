import { useEffect, useState } from "react";
import { HandHeart, CalendarDays, Users, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import axios from "../../config/axiosConfig.js";

export default function PastActivities() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [otpState, setOtpState] = useState({});

  useEffect(() => {
    const fetchDonorRequests = async () => {
      try {
        const res = await axios.get("/api/donor/donor-requests");

        setDonations(res.data);
      } catch (error) {
        console.error("Error fetching donor requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonorRequests();
  }, []);
  const openCancelConfirm = (requestId) => {
    setPendingCancelId(requestId);
    setErrorMessage("");
    setConfirmOpen(true);
  };

  const handleCancelDonation = async () => {
    if (!pendingCancelId) return;

    try {
      await axios.post(`/api/donor/cancel-request/${pendingCancelId}`, {});

      setDonations((prev) =>
        prev.map((donation) =>
          donation._id === pendingCancelId ? { ...donation, status: "cancelled" } : donation
        )
      );
      setConfirmOpen(false);
      setPendingCancelId(null);
    } catch (error) {
      console.error("Error cancelling donation request:", error);
      setErrorMessage(error.response?.data?.message || "Failed to cancel this request.");
    }
  };

  const handleGenerateOtp = async (requestId) => {
    try {
      await axios.post(`/api/donor/generate-pickup-otp/${requestId}`, {});
      setOtpState((prev) => ({ ...prev, [requestId]: { stage: "input" } }));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to generate OTP.");
    }
  };

  const handleVerifyOtp = async (requestId) => {
    try {
      const otp = otpState[requestId]?.value || "";
      const response = await axios.post(`/api/donor/verify-pickup-otp/${requestId}`, { otp });
      setDonations((prev) => prev.map((donation) => donation._id === requestId ? { ...donation, status: response.data.request.status } : donation));
      setOtpState((prev) => ({ ...prev, [requestId]: { stage: "verified" } }));
      setErrorMessage("");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to verify OTP.";
      if (message === "OTP expired") {
        setOtpState((prev) => ({ ...prev, [requestId]: { stage: "input" } }));
      }
      setErrorMessage(message);
    }
  };

  const totalPeopleHelped = donations.reduce((sum, donation) => {
    if (!['accepted', 'collected', 'picked up'].includes(donation.status)) {
      return sum;
    }

    if (donation.donationType === 'food') {
      return sum + (Number(donation.approxPeople) || 0);
    }

    return sum + (Number(donation.quantity) || 0);
  }, 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center justify-center gap-2">
          <HandHeart className="text-pink-500 w-12 h-12" />
          <h1 className="text-4xl font-extrabold text-gray-900">Yayy!!</h1>
        </div>
        <p className="text-lg text-gray-700 mt-4">
          Till date, you have helped over{" "}
          <span className="text-green-600 font-bold text-3xl">
            {loading ? "—" : totalPeopleHelped}
          </span>{" "}
          people!
        </p>
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="inline-block bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-medium">
            Keep up the amazing work!
          </span>
        </motion.div>
      </motion.div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : donations.length === 0 ? (
        <div className="text-center text-gray-500">
          No past donations found.
        </div>
      ) : (
        <div className="grid gap-6">
          {donations.map((donation, index) => (
            <motion.div
              key={donation._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-white p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 capitalize">
                    {donation.status || "Awaiting Pickup"}
                  </h2>
                  {donation.status === "accepted" && donation.acceptedBy && (
                    <p className="mt-1 text-sm text-green-600 font-medium">
                      Accepted By: {donation.acceptedBy.organizationName || donation.acceptedBy.name || "NGO"}
                    </p>
                  )}
                </div>
                {donation.status === "pending" && (
                  <button
                    onClick={() => openCancelConfirm(donation._id)}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                  >
                    Cancel Request
                  </button>
                )}
              </div>

              {donation.status === "accepted" && (
                <div className="flex flex-col gap-2 rounded-xl border border-green-100 bg-green-50 p-3">
                  {otpState[donation._id]?.stage === "input" ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        value={otpState[donation._id]?.value || ""}
                        onChange={(e) => setOtpState((prev) => ({ ...prev, [donation._id]: { ...prev[donation._id], value: e.target.value } }))}
                        placeholder="Enter 6-digit OTP"
                        className="flex-1 rounded-lg border border-green-200 px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => handleVerifyOtp(donation._id)}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Verify
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateOtp(donation._id)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Generate OTP
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center text-gray-500 gap-2 text-sm">
                <CalendarDays className="w-4 h-4" />
                {new Date(donation.createdAt).toLocaleDateString()}
              </div>

              <div className="flex flex-col gap-2 text-gray-500 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {donation.donationType === 'food' ? (
                    <>
                      Helped approx. <span className="text-primary font-medium">{donation.approxPeople || 'N/A'}</span> people
                    </>
                  ) : donation.donationType === 'clothes' ? (
                    <>
                      {donation.quantity || 'N/A'} items of <span className="text-primary font-medium">{donation.clothesType || 'Clothes'}</span>
                    </>
                  ) : donation.donationType === 'toys' ? (
                    <>
                      {donation.quantity || 'N/A'} toys for <span className="text-primary font-medium">{donation.ageGroup || 'All ages'}</span>
                    </>
                  ) : donation.donationType === 'books' ? (
                    <>
                      {donation.quantity || 'N/A'} books by <span className="text-primary font-medium">{donation.author || 'Various'}</span>
                    </>
                  ) : (
                    <>
                      {donation.quantity || donation.approxPeople || 'N/A'} items
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Pickup Location: <span className="text-primary font-medium">{donation.location?.address || 'Unknown address'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Cancel this request?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This action will cancel the donation request and cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setPendingCancelId(null);
                  setErrorMessage("");
                }}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Keep Request
              </button>
              <button
                onClick={handleCancelDonation}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
