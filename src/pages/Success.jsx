import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import  useStore  from "../store"; // Adjust the import based on your project structure

export default function Success() {
  const { user } = useStore();

  useEffect(() => {
    if (!user) {
      toast.warn("You need to log in first.");
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <ToastContainer />
      <h1 className="text-3xl font-bold">Registration Successful! 🎉</h1>
    </div>
  );
}
