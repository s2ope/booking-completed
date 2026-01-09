import React from "react";
import useFetch from "../../hooks/useFetch";

const Featured = () => {
  const { data, loading, error } = useFetch(
    "/api/hotels/countByCity?cities=berlin,madrid,london"
  );

  const cities = [
    {
      name: "Berlin",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNP86CEng9rqufG-moTmBi-DkrpHzG9r6DAQ&s",
    },
    {
      name: "Madrid",
      imageUrl:
        "https://cf.bstatic.com/xdata/images/city/max500/690334.webp?k=b99df435f06a15a1568ddd5f55d239507c0156985577681ab91274f917af6dbb&o=",
    },
    {
      name: "London",
      imageUrl:
        "https://cf.bstatic.com/xdata/images/city/max500/689422.webp?k=2595c93e7e067b9ba95f90713f80ba6e5fa88a66e6e55600bd27a5128808fdf2&o=",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {loading ? (
        <div className="flex gap-2 overflow-x-auto">
          {cities.map((_, index) => (
            <div
              key={index}
              className="flex-none w-60 sm:w-64 h-44 sm:h-48 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 text-center text-lg sm:text-xl font-medium w-full">
          Failed to load data. Please try again later.
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {cities.map((city, index) => (
            <div
              key={index}
              className="group relative text-white rounded-lg flex-none w-60 sm:w-64 h-44 sm:h-48 cursor-pointer transition-transform duration-300 hover:scale-105"
            >
              <img
                src={city.imageUrl}
                alt={city.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg" />
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 p-2 sm:p-3 rounded-lg backdrop-blur-sm bg-black/30 transition-all duration-300 group-hover:bg-black/50">
                <h1 className="text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">
                  {city.name}
                </h1>
                <h2 className="text-sm sm:text-base font-medium">
                  {data ? (
                    <span>
                      <span className="text-lg sm:text-xl font-bold">
                        {data[index]}
                      </span>{" "}
                      properties
                    </span>
                  ) : (
                    "Loading..."
                  )}
                </h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Featured;
