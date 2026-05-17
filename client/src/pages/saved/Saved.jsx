import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import Navbar from "../../components/navbar/Navbar";
import SearchItem from "../../components/searchItem/SearchItem";
import { AuthContext } from "../../context/AuthContext";
import { SavedHotelsContext } from "../../context/SavedHotelsContext";

const Saved = () => {
  const { user } = useContext(AuthContext);
  const { savedHotels, loading, refreshSavedHotels } =
    useContext(SavedHotelsContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/saved" } });
      return;
    }

    refreshSavedHotels().catch(() => {});
  }, [navigate, user?._id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Header type="list" />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Saved Properties</h1>
          <p className="mt-2 text-gray-600">
            Keep track of places you want to book later.
          </p>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Loading saved properties...
          </div>
        ) : savedHotels.length === 0 ? (
          <div className="rounded-md bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold">No saved properties yet</h2>
            <p className="mt-2 text-gray-600">
              Save hotels from search results or hotel detail pages.
            </p>
            <Link
              to="/hotels"
              className="mt-5 inline-flex rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Browse stays
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedHotels.map((hotel) => (
              <SearchItem key={hotel._id} item={hotel} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Saved;
