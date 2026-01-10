import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import useStore from "../store";
import { useParams } from "react-router-dom";
import { updateAllergy } from "../services/api";
import axios from "axios";
import StylishLoader from "../components/StylishLoader";

export default function WelcomePage() {
  const { id } = useParams();
  const { user, setUser, setError } = useStore();
  const [hasAllergy, setHasAllergy] = useState(false);
  const [allergies, setAllergies] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/registration/${id}`
        );
        setUser(response.data.user);
        setHasAllergy(response.data.user.hasAllergy || false);
        setAllergies(response.data.user.allergies || "");
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setError("Failed to fetch user data.");
      }
    };
    fetchUser();
  }, [id, setUser, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateAllergy(id, { hasAllergy, allergies });
      toast.success("Allergy info saved successfully!");
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to save allergy info:", error);
      toast.error(
        error.response?.data?.message || "Failed to save allergy info"
      );
    }
  };

  // const handleResend = async () => {
  //   try {
  //     await resendTicket(id);
  //     toast.success("Ticket resend requested — check your email.");
  //   } catch (err) {
  //     console.error("Resend failed:", err);
  //     toast.error(err.response?.data?.message || "Failed to resend ticket");
  //   }
  // };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <StylishLoader size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Welcome, {user.fullName}!</h2>
        <p className="mb-4">Your phone number: {user.phone}</p>

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={hasAllergy}
            onChange={(e) => setHasAllergy(e.target.checked)}
          />
          Do you have allergies?
        </label>

        {hasAllergy && (
          <input
            type="text"
            placeholder="What are you allergic to?"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="w-full mb-4 p-3 border rounded-lg"
          />
        )}

        <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition">
          Save Allergy Info
        </button>
        {/* <button
          type="button"
          onClick={handleResend}
          className="w-full mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Resend Ticket to Email
        </button> */}
      </form>
    </div>
  );
}
