import { Link } from "react-router-dom";

const SearchItem = ({ item }) => {
  return (
    <div className="searchItem border border-lightgray p-2.5 rounded-md flex justify-between gap-5 mb-5">
      <img
        src={item.photos[0]}
        alt=""
        className="siImg w-48 h-48 object-cover"
      />
      <div className="siDesc flex flex-col gap-2.5 flex-2">
        <h1 className="siTitle text-lg text-[#0071c2]">{item.name}</h1>
        <span className="siDistance text-xs">{item.distance}m from center</span>
        <span className="siTaxiOp bg-[#008009] text-white text-xs py-0.5 px-2 rounded-md">
          Free airport taxi
        </span>
        <span className="siSubtitle text-xs font-bold">
          Studio Apartment with Air conditioning
        </span>
        <span className="siFeatures text-xs">{item.desc}</span>
        <span className="siCancelOp text-xs font-bold text-[#008009]">
          Free cancellation{" "}
        </span>
        <span className="siCancelOpSubtitle text-xs text-[#008009]">
          You can cancel later, so lock in this great price today!
        </span>
      </div>
      <div className="siDetails flex-1 flex flex-col justify-between">
        {item.rating && (
          <div className="siRating flex justify-between">
            <span className="font-medium">Excellent</span>
            <button className="bg-[#003580] text-white py-1 px-3 font-bold border-none">
              {item.rating}
            </button>
          </div>
        )}
        <div className="siDetailTexts text-right flex flex-col gap-1.25">
          <span className="siPrice text-2xl">${item.cheapestPrice}</span>
          <span className="siTaxOp text-xs text-gray-500">
            Includes taxes and fees
          </span>
          <Link to={`/hotels/${item._id}`}>
            <button className="siCheckButton bg-[#0071c2] text-white font-bold py-2.5 px-1.25 rounded-md border-none cursor-pointer">
              See availability
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchItem;
