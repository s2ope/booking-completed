import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import axios from "axios";
import { api } from "../../api/axios";
import { showToast } from "../../helpers/ToastHelper";

const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_API_URL;

const New = ({ inputs, title }) => {
  const [file, setFile] = useState("");
  const [info, setInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const validateForm = () => {
    // Check required fields
    for (const input of inputs) {
      if (input.required && !info[input.id]) {
        showToast("error", `Please fill in ${input.label}`);
        return false;
      }
    }

    // Validate email format if email field exists
    if (info.email && !/\S+@\S+\.\S+/.test(info.email)) {
      showToast("error", "Please enter a valid email address");
      return false;
    }

    // Validate password if it exists
    if (info.password && info.password.length < 6) {
      showToast("error", "Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let imageUrl = "";

      // Upload image if file is selected
      if (file) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "upload");

        try {
          const uploadRes = await axios.post(CLOUDINARY_URL, data);
          imageUrl = uploadRes.data.url;
          showToast("Image uploaded successfully");
        } catch (error) {
          showToast("error", "Failed to upload image");
          console.error("Image upload error:", error);
          setIsLoading(false);
          return;
        }
      }

      const newUser = {
        ...info,
        img: imageUrl || "",
      };

      const response = await api.post("/api/auth/register", newUser);

      if (response.data) {
        showToast("User registered successfully");
        // Reset form
        setFile("");
        setInfo({});
        // Reset form inputs
        const formElement = e.target.closest("form");
        if (formElement) formElement.reset();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      showToast("error", errorMessage);
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt="User"
            />
          </div>
          <div className="right">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                  accept="image/*"
                />
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>
                    {input.label}
                    {input.required && <span style={{ color: "red" }}>*</span>}
                  </label>
                  <input
                    onChange={handleChange}
                    type={input.type}
                    placeholder={input.placeholder}
                    id={input.id}
                    required={input.required}
                    disabled={isLoading}
                  />
                </div>
              ))}
              <button
                onClick={handleClick}
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "Processing..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
