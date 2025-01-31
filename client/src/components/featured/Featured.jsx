import React from "react";
import useFetch from "../../hooks/useFetch";

const Featured = () => {
  const { data, loading, error } = useFetch(
    "http://localhost:8800/api/hotels/countByCity?cities=berlin,madrid,london"
  );

  const cities = [
    {
      name: "Berlin",
      imageUrl:
        "https://cf.bstatic.com/xdata/images/city/max500/957801.webp?k=a969e39bcd40cdcc21786ba92826063e3cb09bf307bcfeac2aa392b838e9b7a5&o=",
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
    <div className="w-full max-w-5xl mx-auto flex gap-2 z-10 px-4">
      {loading ? (
        <div className="flex w-full gap-2">
          {cities.map((city, index) => (
            <div
              key={index}
              className="flex-1 min-w-[200px] h-[180px] bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 text-xl text-center w-full font-medium">
          Failed to load data. Please try again later.
        </div>
      ) : (
        cities.map((city, index) => (
          <div
            className="group relative text-white rounded-lg overflow-hidden h-[180px] flex-1 min-w-[200px] cursor-pointer transition-transform duration-300 hover:scale-105"
            key={index}
          >
            <img
              src={city.imageUrl}
              alt={city.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4 p-3 rounded-lg backdrop-blur-sm bg-black/30 transition-all duration-300 group-hover:bg-black/50">
              <h1 className="text-lg font-semibold mb-1">{city.name}</h1>
              <h2 className="text-base font-medium">
                {data ? (
                  <span>
                    <span className="text-xl font-bold">{data[index]}</span>{" "}
                    properties
                  </span>
                ) : (
                  "Loading..."
                )}
              </h2>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Featured;
