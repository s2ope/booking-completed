import React from "react";
import useFetch from "../../hooks/useFetch";

const FeaturedProperties = () => {
  const { data, loading, error } = useFetch(
    "http://localhost:8800/api/hotels?featured=true&limit=4"
  );

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto flex flex-wrap justify-between gap-2 px-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="fpItem flex-1 min-w-[200px] flex flex-col"
          >
            <div className="relative rounded-lg overflow-hidden">
              <div className="w-full h-[180px] bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
            <div className="mt-2 space-y-2">
              <div className="w-[80%] h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="w-[60%] h-3 bg-gray-200 animate-pulse rounded"></div>
              <div className="w-[50%] h-3 bg-gray-200 animate-pulse rounded"></div>
              <div className="flex items-center gap-2">
                <div className="bg-gray-200 w-12 h-6 animate-pulse rounded"></div>
                <div className="w-[50%] h-3 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center text-red-500 text-xl font-medium">
        Error loading featured properties
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-wrap justify-between gap-2 px-4">
      {data.map((item) => (
        <div
          className="flex-1 min-w-[200px] flex flex-col cursor-pointer group"
          key={item._id}
        >
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={item.photos?.[0] || "default-image-url.jpg"}
              alt={item.name}
              className="w-full h-[180px] object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {item.rating && (
              <div className="absolute top-2 right-2">
                <div className="bg-blue-700 text-white px-2 py-1 rounded-md font-bold text-sm backdrop-blur-sm">
                  {item.rating}
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 space-y-1">
            <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
              {item.name}
            </h3>
            <p className="text-sm text-gray-600 capitalize">{item.city}</p>
            <p className="text-sm font-medium text-gray-700">
              Starting from{" "}
              <span className="text-base font-bold text-blue-700">
                ${item.cheapestPrice}
              </span>
            </p>
            {item.rating && (
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-semibold text-sm">
                  Excellent
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedProperties;
