import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";
import { AuthContext } from "./AuthContext";

export const SavedHotelsContext = createContext({
  savedHotels: [],
  savedIds: [],
  loading: false,
  refreshSavedHotels: async () => {},
  saveHotel: async () => {},
  unsaveHotel: async () => {},
  isSaved: () => false,
});

export const SavedHotelsContextProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [savedHotels, setSavedHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshSavedHotels = async () => {
    if (!user) {
      setSavedHotels([]);
      return [];
    }

    setLoading(true);
    try {
      const response = await api.get("/users/me/saved");
      const hotels = Array.isArray(response.data) ? response.data : [];
      setSavedHotels(hotels);
      return hotels;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSavedHotels().catch(() => setSavedHotels([]));
  }, [user?._id]);

  const saveHotel = async (hotelId) => {
    const response = await api.post(`/users/me/saved/${hotelId}`);
    setSavedHotels(response.data.savedHotels || []);
    return response.data.savedHotels || [];
  };

  const unsaveHotel = async (hotelId) => {
    const response = await api.delete(`/users/me/saved/${hotelId}`);
    setSavedHotels(response.data.savedHotels || []);
    return response.data.savedHotels || [];
  };

  const savedIds = useMemo(
    () => savedHotels.map((hotel) => String(hotel._id)),
    [savedHotels]
  );

  const value = useMemo(
    () => ({
      savedHotels,
      savedIds,
      loading,
      refreshSavedHotels,
      saveHotel,
      unsaveHotel,
      isSaved: (hotelId) => savedIds.includes(String(hotelId)),
    }),
    [savedHotels, savedIds, loading]
  );

  return (
    <SavedHotelsContext.Provider value={value}>
      {children}
    </SavedHotelsContext.Provider>
  );
};
