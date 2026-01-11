import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import useStore from "../store";
import { updateAllergy } from "../services/api";
import StylishLoader from "../components/StylishLoader";
import SuccessAnimation from "../components/SuccessAnimation";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function WelcomePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, setUser, setError } = useStore();

  const [hasAllergy, setHasAllergy] = useState(false);
  const [allergies, setAllergies] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  //  Fetch User
  useEffect(() => {
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/registration/${id}`, {
          signal: controller.signal,
        });

        const fetchedUser = response.data.user;
        setUser(fetchedUser);
        setHasAllergy(Boolean(fetchedUser?.hasAllergy));
        setAllergies(fetchedUser?.allergies || "");
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error("Failed to fetch user:", error);
        setError("Failed to fetch user data.");
        toast.error("Unable to load profile");
      }
    };

    fetchUser();

    return () => controller.abort();
  }, [id, setUser, setError]);

  //  Auto Redirect After Success
  useEffect(() => {
    if (!saved) return;

    const timer = setTimeout(() => {
      navigate("/thank-you"); // change route if needed
    }, 2500);

    return () => clearTimeout(timer);
  }, [saved, navigate]);

  //  Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasAllergy && !allergies.trim()) {
      toast.error("Please specify your allergy");
      return;
    }

    if (saving) return;

    setSaving(true);
    try {
      const response = await updateAllergy(id, {
        hasAllergy,
        allergies: hasAllergy ? allergies : "",
      });

      setUser(response.data.user);
      setSaved(true); // Trigger animation

      toast.success("Allergy info saved successfully!");
    } catch (error) {
      console.error("Failed to save allergy info:", error);
      toast.error(
        error.response?.data?.message || "Failed to save allergy info"
      );
    } finally {
      setSaving(false);
    }
  };

  //  Loading State
  if (!user && !saved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <StylishLoader size="lg" text="Loading profile..." />
        <ToastContainer />
      </div>
    );
  }

  //  Success State
  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <SuccessAnimation />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  //  Form UI
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-2">Welcome, {user.fullName}!</h2>

        <p className="mb-4 text-gray-600">Phone number: {user.phone}</p>

        <div className="flex items-center gap-2 mb-4">
          <input
            id="hasAllergy"
            type="checkbox"
            checked={hasAllergy}
            onChange={(e) => setHasAllergy(e.target.checked)}
          />
          <label htmlFor="hasAllergy" className="cursor-pointer">
            Do you have allergies?
          </label>
        </div>

        {hasAllergy && (
          <input
            type="text"
            placeholder="What are you allergic to?"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="w-full mb-4 p-3 border rounded-lg"
          />
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Allergy Info"}
        </button>
      </form>
    </div>
  );
}
