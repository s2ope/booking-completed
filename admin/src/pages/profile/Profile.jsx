import "./profile.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { showToast } from "../../helpers/ToastHelper";

const fallbackAvatar =
  "https://images.pexels.com/photos/941693/pexels-photo-941693.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500";

const Profile = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    phone: "",
    city: "",
    country: "",
    img: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
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
          img: response.data.img || "",
        });
      } catch (err) {
        const message = err.response?.data?.message || "Could not load profile";
        setError(message);

        if (err.response?.status === 401 || err.response?.status === 403) {
          dispatch({ type: "LOGOUT" });
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch, navigate, user?._id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await api.put("/users/me", form);
      setProfile(response.data);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { ...user, ...response.data },
      });
      showToast("Profile updated successfully", "success");
    } catch (err) {
      const message = err.response?.data?.message || "Could not update profile";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const avatar = form.img || profile?.img || fallbackAvatar;

  return (
    <div className="profile">
      <Sidebar />
      <div className="profileContainer">
        <Navbar />
        <div className="profileHeader">
          <h1>Admin Profile</h1>
        </div>

        <div className="profileContent">
          {loading ? (
            <div className="profileCard message">Loading profile...</div>
          ) : error && !profile ? (
            <div className="profileCard error">{error}</div>
          ) : (
            <form className="profileCard" onSubmit={handleSubmit}>
              <div className="profilePreview">
                <img src={avatar} alt={profile?.username || "Admin"} />
                <h2>{profile?.username}</h2>
                <span>{profile?.isAdmin ? "Admin" : "User"}</span>
              </div>

              <div className="profileForm">
                <div className="profileFields">
                  <label>
                    Username
                    <input value={profile?.username || ""} disabled />
                  </label>
                  <label>
                    Email
                    <input value={profile?.email || ""} disabled />
                  </label>
                  <label>
                    Phone
                    <input name="phone" value={form.phone} onChange={handleChange} />
                  </label>
                  <label>
                    City
                    <input name="city" value={form.city} onChange={handleChange} />
                  </label>
                  <label>
                    Country
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Image URL
                    <input name="img" value={form.img} onChange={handleChange} />
                  </label>
                </div>

                {error && <p className="profileError">{error}</p>}

                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
