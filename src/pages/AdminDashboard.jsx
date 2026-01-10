import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAdminStore from "../store/adminStore";
import { adminApi } from "../services/api";
import CheckInModal from "../components/CheckInModal";
import StylishLoader from "../components/StylishLoader";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    logout,
    isAuthenticated,
    login,
    recordFailedAttempt,
    isLocked,
    verifySession,
  } = useAdminStore();

  // Local login UI state when not authenticated
  const [tokenInput, setTokenInput] = useState("");

  // Data states
  const [registrations, setRegistrations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filter states
  const [search, setSearch] = useState("");
  const [allergiesOnly, setAllergiesOnly] = useState(false);
  const [ticketFilter, setTicketFilter] = useState(null);
  const [checkinFilter, setCheckinFilter] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");

  // UI states
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [activeTab, setActiveTab] = useState("users"); // users, analytics
  const [qrModalUser, setQrModalUser] = useState(null); // QR code modal state

  // Logout handler
  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/admin/login");
  };

  // Fetch registrations
  const fetchRegistrations = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getRegistrations({
        page,
        limit: pagination.limit,
        search,
        allergiesOnly: allergiesOnly ? "true" : "false",
        ticketSent: ticketFilter,
        checkedIn: checkinFilter,
        sortBy,
      });
      setRegistrations(res.data.registrations);
      setPagination(res.data.pagination);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        navigate("/admin/login");
      } else {
        toast.error(
          err.response?.data?.message || "Failed to fetch registrations"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        navigate("/admin/login");
      } else {
        toast.error("Failed to fetch analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  // Send ticket to single user
  const handleSendTicket = async (id) => {
    try {
      await adminApi.sendTicket(id);
      toast.success("Ticket sent successfully");
      fetchRegistrations(pagination.page);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        navigate("/admin/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to send ticket");
      }
    }
  };

  // Bulk send tickets
  const handleBulkSendTickets = async () => {
    if (selectedUsers.size === 0) {
      toast.warning("Select at least one user");
      return;
    }
    try {
      const res = await adminApi.sendTicketsBulk(Array.from(selectedUsers));
      toast.success(`Tickets sent to ${res.data.updated} users`);
      setSelectedUsers(new Set());
      fetchRegistrations(pagination.page);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        navigate("/admin/login");
      } else {
        toast.error("Failed to send tickets");
      }
    }
  };

  // Toggle check-in
  const handleToggleCheckIn = async (id) => {
    try {
      const response = await adminApi.toggleCheckIn(id);
      toast.success("Check-in status updated");

      // Show QR code modal if checking in
      if (response.data.user.checkedIn) {
        setQrModalUser(response.data.user);
      }

      fetchRegistrations(pagination.page);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        navigate("/admin/login");
      } else {
        toast.error("Failed to update check-in status");
      }
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      const res = await adminApi.exportCsv();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "registrations.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("CSV exported successfully");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        navigate("/admin/login");
      } else {
        toast.error("Failed to export CSV");
      }
    }
  };

  // Handle checkbox
  const handleSelectUser = (id) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedUsers(newSet);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.size === registrations.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(registrations.map((r) => r._id)));
    }
  };

  // Load on tab change
  useEffect(() => {
    if (activeTab === "users" && isAuthenticated) {
      fetchRegistrations(1);
    } else if (activeTab === "analytics" && isAuthenticated) {
      fetchAnalytics();
    }
  }, [activeTab, isAuthenticated]);

  // Verify session on mount
  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLocked) {
      toast.error("Account locked. Try again later.");
      return;
    }
    const token = tokenInput.trim();
    if (!token) {
      toast.error("Please enter an admin token");
      return;
    }
    try {
      const res = await fetch(
        `${
          import.meta.env.BACKEND_URL || "http://localhost:5000/api"
        }/admin/verify-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        }
      );

      if (!res.ok) {
        recordFailedAttempt();
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Invalid admin token");
        setTokenInput("");
        return;
      }

      const data = await res.json();
      login(token, data.expiryMinutes || 60);
      toast.success("Login successful");
      fetchRegistrations(1);
    } catch (err) {
      console.error(err);
      recordFailedAttempt();
      toast.error("Login failed. Check your connection.");
    }
  };

  // Handle filters
  useEffect(() => {
    if (activeTab === "users") {
      fetchRegistrations(1);
    }
  }, [search, allergiesOnly, ticketFilter, checkinFilter, sortBy]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6">
        <ToastContainer />
        {qrModalUser && (
          <CheckInModal
            user={qrModalUser}
            onClose={() => setQrModalUser(null)}
          />
        )}
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mb-6">
            Enter your admin token to access the dashboard
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin Token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Login
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Token:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              admin-secret-key
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      {qrModalUser && (
        <CheckInModal user={qrModalUser} onClose={() => setQrModalUser(null)} />
      )}
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Event Admin Dashboard
            </h1>
            <p className="text-gray-600 text-sm">
              Manage registrations and attendees
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "users"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Users ({analytics?.totalRegistrations || 0})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "analytics"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold text-gray-800 mb-4">
                Filters & Search
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="createdAt">Sort by Date</option>
                  <option value="fullName">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                </select>
                <select
                  value={ticketFilter || ""}
                  onChange={(e) => setTicketFilter(e.target.value || null)}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Ticket Status</option>
                  <option value="true">Ticket Sent</option>
                  <option value="false">No Ticket</option>
                </select>
                <select
                  value={checkinFilter || ""}
                  onChange={(e) => setCheckinFilter(e.target.value || null)}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Check-in</option>
                  <option value="true">Checked In</option>
                  <option value="false">Not Checked In</option>
                </select>
                <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allergiesOnly}
                    onChange={(e) => setAllergiesOnly(e.target.checked)}
                  />
                  <span>Allergies Only</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
              <div>
                <p className="text-gray-700">
                  <strong>{selectedUsers.size}</strong> user(s) selected
                </p>
              </div>
              <div className="flex gap-3">
                {selectedUsers.size > 0 && (
                  <button
                    onClick={handleBulkSendTickets}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Send Tickets ({selectedUsers.size})
                  </button>
                )}
                <button
                  onClick={handleExportCsv}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedUsers.size === registrations.length &&
                            registrations.length > 0
                          }
                          onChange={handleSelectAll}
                          className="cursor-pointer"
                        />
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Phone
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Allergy
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Ticket
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Check-in
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="p-4 text-center text-gray-600"
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : registrations.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="p-4 text-center text-gray-600"
                        >
                          No registrations found
                        </td>
                      </tr>
                    ) : (
                      registrations.map((reg) => (
                        <tr key={reg._id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(reg._id)}
                              onChange={() => handleSelectUser(reg._id)}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="p-4 font-medium text-gray-800">
                            {reg.fullName}
                          </td>
                          <td className="p-4 text-gray-700">{reg.email}</td>
                          <td className="p-4 text-gray-700">{reg.phone}</td>
                          <td className="p-4">
                            {reg.hasAllergy ? (
                              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                Yes: {reg.allergies}
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                No
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {reg.ticketSent ? (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                Sent
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleCheckIn(reg._id)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                                reg.checkedIn
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              }`}
                            >
                              {reg.checkedIn ? "✓ In" : "Out"}
                            </button>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleSendTicket(reg._id)}
                              disabled={reg.ticketSent}
                              className={`px-3 py-1 rounded text-sm font-medium transition ${
                                reg.ticketSent
                                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                            >
                              {reg.ticketSent ? "Sent" : "Send"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
                <p className="text-gray-700 text-sm">
                  Page {pagination.page} of {pagination.pages} (
                  {pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchRegistrations(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchRegistrations(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold uppercase mb-2">
                Total Registrations
              </h3>
              <p className="text-4xl font-bold text-blue-600">
                {analytics.totalRegistrations}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold uppercase mb-2">
                With Allergies
              </h3>
              <p className="text-4xl font-bold text-red-600">
                {analytics.withAllergies}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                ({analytics.withoutAllergies} without)
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold uppercase mb-2">
                Checked In
              </h3>
              <p className="text-4xl font-bold text-green-600">
                {analytics.checkedIn}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                ({analytics.notCheckedIn} pending)
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-semibold uppercase mb-2">
                Tickets Sent
              </h3>
              <p className="text-4xl font-bold text-purple-600">
                {analytics.ticketSent}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                ({analytics.ticketNotSent} pending)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
