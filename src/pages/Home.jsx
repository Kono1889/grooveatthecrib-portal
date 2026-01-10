import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">House Party 2026 🚀</h1>
        <p className="text-gray-600 mb-6">
          Join us this June for an Epic and Memorable Event.
        </p>

        <Link
          to="/register"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Register Now
        </Link>
      </div>
    </div>
  );
}
