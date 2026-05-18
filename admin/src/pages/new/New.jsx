import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/axios";
import { showToast } from "../../helpers/ToastHelper";
import { uploadImage } from "../../utils/uploadImage";

const New = ({ inputs, title }) => {
  const [file, setFile] = useState("");
  const [info, setInfo] = useState({ isAdmin: false });
  const [isLoading, setIsLoading] = useState(false);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setInfo((prev) => ({ ...prev, [e.target.id]: value }));
  };

  const validateForm = () => {
    // Check required fields
    for (const input of inputs) {
      if (input.required && !info[input.id]) {
        showToast(`Please fill in ${input.label}`, "error");
        return false;
      }
    }

    // Validate email format if email field exists
    if (info.email && !/\S+@\S+\.\S+/.test(info.email)) {
      showToast("Please enter a valid email address", "error");
      return false;
    }

    // Validate password if it exists
    if (info.password && info.password.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
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
        try {
          imageUrl = await uploadImage(file);
          showToast("Image uploaded successfully");
        } catch (error) {
          showToast(error.message || "Failed to upload image", "error");
          console.error("Image upload error:", error);
          setIsLoading(false);
          return;
        }
      }

      const newUser = {
        ...info,
        img: imageUrl || "",
      };

      const response = await api.post("/auth/register", newUser);

      if (response.data) {
        showToast("User registered successfully");
        // Reset form
        setFile("");
        setInfo({ isAdmin: false });
        // Reset form inputs
        const formElement = e.target.closest("form");
        if (formElement) formElement.reset();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      showToast(errorMessage, "error");
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
                previewUrl ||
                "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
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
                  disabled={isLoading}
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
                    value={info[input.id] || ""}
                    required={input.required}
                    disabled={isLoading}
                  />
                </div>
              ))}
              <div className="formInput">
                <label>Admin Access</label>
                <select
                  id="isAdmin"
                  value={String(info.isAdmin)}
                  onChange={(e) =>
                    setInfo((prev) => ({
                      ...prev,
                      isAdmin: e.target.value === "true",
                    }))
                  }
                  disabled={isLoading}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
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
