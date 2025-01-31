import React from "react";
import useFetch from "../../hooks/useFetch.js";

const PropertyList = () => {
  const { data, loading, error } = useFetch(
    "http://localhost:8800/api/hotels/countByType"
  );

  const images = [
    "https://cf.bstatic.com/xdata/images/xphoto/square300/57584488.webp?k=bf724e4e9b9b75480bbe7fc675460a089ba6414fe4693b83ea3fdd8e938832a6&o=",
    "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-apartments_300/9f60235dc09a3ac3f0a93adbc901c61ecd1ce72e.jpg",
    "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/bg_resorts/6f87c6143fbd51a0bb5d15ca3b9cf84211ab0884.jpg",
    "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-villas_300/dd0d7f8202676306a661aa4f0cf1ffab31286211.jpg",
    "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-chalet_300/8ee014fcc493cb3334e25893a1dee8c6d36ed0ba.jpg",
  ];

  if (error) {
    return (
      <div className="text-red-500 text-base text-center">
        Error loading property types
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {loading ? (
          <>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex flex-col">
                <div className="relative h-[140px] rounded-lg overflow-hidden bg-gray-200 animate-pulse"></div>
                <div className="mt-2 space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {data &&
              images.map((img, i) => (
                <div
                  key={i}
                  className="group cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={data[i]?.type || "Property"}
                      className="w-full h-[140px] object-cover transform transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="mt-2">
                    <h3 className="text-sm font-semibold text-gray-800 capitalize group-hover:text-blue-700 transition-colors">
                      {data[i]?.type}
                    </h3>
                    <p className="text-gray-600 mt-0.5">
                      <span className="text-sm font-medium">
                        {data[i]?.count.toLocaleString()}
                      </span>
                      <span className="text-gray-500 text-xs ml-1">
                        {data[i]?.type.toLowerCase()}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyList;
