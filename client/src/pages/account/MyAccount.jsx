import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import Header from "../../components/header/Header";
import Navbar from "../../components/navbar/Navbar";
import { AuthContext } from "../../context/AuthContext";
import { showToast } from "../../helpers/ToastHelper";

const MyAccount = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: "", city: "", country: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/my-account" } });
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/me");
        setProfile(response.data);
        setForm({
          phone: response.data.phone || "",
          city: response.data.city || "",
          country: response.data.country || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Could not load your account.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, user?._id]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.put("/users/me", form);
      setProfile(response.data);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { ...user, ...response.data },
      });
      showToast("Account updated successfully.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update account.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Header type="list" />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">My Account</h1>

        {loading ? (
          <div className="rounded-md bg-white p-8 text-center text-gray-500 shadow-sm">
            Loading account...
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-md bg-white p-6 shadow-sm"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-600">
                  Username
                </span>
                <input
                  value={profile?.username || ""}
                  disabled
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-600">
                  Email
                </span>
                <input
                  value={profile?.email || ""}
                  disabled
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-600">
                  Phone
                </span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-600">
                  City
                </span>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-gray-600">
                  Country
                </span>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default MyAccount;
