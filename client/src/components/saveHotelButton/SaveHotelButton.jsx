import { useContext, useState } from "react";
import { Bookmark } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { SavedHotelsContext } from "../../context/SavedHotelsContext";
import { showToast } from "../../helpers/ToastHelper";
import { trackClarityEvent } from "../../utils/clarity";

const SaveHotelButton = ({ hotelId, className = "", label = false }) => {
  const { user } = useContext(AuthContext);
  const { isSaved, saveHotel, unsaveHotel } = useContext(SavedHotelsContext);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const saved = isSaved(hotelId);

  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      trackClarityEvent(
        "saved_property_login_required",
        {
          clarity_hotel_id: hotelId,
          clarity_saved_action: saved ? "remove" : "add",
        },
        "saved property intent",
      );
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    setSaving(true);
    trackClarityEvent("saved_property_submitted", {
      clarity_hotel_id: hotelId,
      clarity_saved_action: saved ? "remove" : "add",
    });
    try {
      if (saved) {
        await unsaveHotel(hotelId);
        trackClarityEvent("saved_property_removed", {
          clarity_hotel_id: hotelId,
        });
        showToast("Removed from saved properties.", "info");
      } else {
        await saveHotel(hotelId);
        trackClarityEvent(
          "saved_property_added",
          {
            clarity_hotel_id: hotelId,
          },
          "saved property intent",
        );
        showToast("Saved property.", "success");
      }
    } catch (error) {
      trackClarityEvent("saved_property_error", {
        clarity_hotel_id: hotelId,
        clarity_saved_action: saved ? "remove" : "add",
        clarity_error_status: error.response?.status || "unknown",
      });
      showToast(
        error.response?.data?.message || "Could not update saved properties.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      aria-label={saved ? "Remove saved property" : "Save property"}
      data-clarity-event={saved ? "unsave_property_click" : "save_property_click"}
      data-clarity-label={saved ? "Remove saved property" : "Save property"}
      data-clarity-upgrade="saved property intent"
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60 ${className}`}
    >
      <Bookmark
        className="h-4 w-4"
        fill={saved ? "currentColor" : "none"}
      />
      {label && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
};

export default SaveHotelButton;
