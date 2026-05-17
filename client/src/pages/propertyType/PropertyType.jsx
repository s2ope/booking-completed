import { Link, useParams } from "react-router-dom";
import Header from "../../components/header/Header";
import Navbar from "../../components/navbar/Navbar";
import SearchItem from "../../components/searchItem/SearchItem";
import useFetch from "../../hooks/useFetch";

const typeCopy = {
  hotel: "Hotels",
  apartment: "Apartments",
  resort: "Resorts",
  villa: "Villas",
  cabin: "Cabins",
};

const normalizeType = (type = "") =>
  ({
    apartments: "apartment",
    resorts: "resort",
    villas: "villa",
    cabins: "cabin",
  }[type.toLowerCase()] || type.toLowerCase());

const PropertyType = () => {
  const { type = "" } = useParams();
  const normalizedType = normalizeType(type);
  const title = typeCopy[normalizedType] || "Properties";
  const { data, loading, error } = useFetch(
    `/hotels?type=${encodeURIComponent(normalizedType)}&min=0&max=999`
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Header type="list" />

      <section className="bg-[#003580] text-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="mt-2 text-base">
            {loading
              ? "Loading available stays..."
              : `${Array.isArray(data) ? data.length : 0} matching properties`}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Browse {title}</h2>
          <Link to="/hotels" className="text-sm font-medium text-blue-600">
            Search all stays
          </Link>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading hotels...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">
            Could not load this property type.
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-md bg-white p-8 text-center text-gray-600 shadow-sm">
            No properties found for this type yet.
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

export default PropertyType;
