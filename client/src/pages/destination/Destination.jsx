import { Link, useParams } from "react-router-dom";
import Header from "../../components/header/Header";
import Navbar from "../../components/navbar/Navbar";
import SearchItem from "../../components/searchItem/SearchItem";
import useFetch from "../../hooks/useFetch";

const cityImages = {
  berlin:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNP86CEng9rqufG-moTmBi-DkrpHzG9r6DAQ&s",
  madrid:
    "https://cf.bstatic.com/xdata/images/city/max500/690334.webp?k=b99df435f06a15a1568ddd5f55d239507c0156985577681ab91274f917af6dbb&o=",
  london:
    "https://cf.bstatic.com/xdata/images/city/max500/689422.webp?k=2595c93e7e067b9ba95f90713f80ba6e5fa88a66e6e55600bd27a5128808fdf2&o=",
  usa: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
};

const Destination = () => {
  const { city = "" } = useParams();

  // decoded original value (for UI)
  const displayCity = decodeURIComponent(city);

  // normalized lowercase key (for API + mapping)
  const cityKey = displayCity.toLowerCase();

  const { data, loading, error } = useFetch(
    `/hotels?city=${encodeURIComponent(cityKey)}&min=0&max=999`,
  );

  const image = cityImages[cityKey] || data?.[0]?.photos?.[0] || cityImages.usa;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Header type="list" />

      {/* HERO SECTION */}
      <section className="relative h-64 w-full overflow-hidden bg-gray-900 text-white">
        <img
          src={image}
          alt={displayCity}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-end px-4 pb-8">
          <h1 className="text-4xl font-bold">{displayCity}</h1>
          <p className="mt-2 text-base">
            {loading
              ? "Loading available stays..."
              : `${Array.isArray(data) ? data.length : 0} properties available`}
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Stays in {displayCity}</h2>
          <Link to="/hotels" className="text-sm font-medium text-blue-600">
            Search all stays
          </Link>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Loading hotels...
          </div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">
            Could not load this destination.
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-md bg-white p-8 text-center text-gray-600 shadow-sm">
            No properties found for this destination yet.
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((hotel) => (
              <SearchItem key={hotel._id} item={hotel} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Destination;
