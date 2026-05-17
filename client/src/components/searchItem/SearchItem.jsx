import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import SaveHotelButton from "../saveHotelButton/SaveHotelButton";
import { SearchContext } from "../../context/SearchContext";

const SearchItem = ({ item, searchState }) => {
  const navigate = useNavigate();
  const { dispatch } = useContext(SearchContext);

  const openDetails = () => {
    if (searchState) {
      dispatch({ type: "NEW_SEARCH", payload: searchState });
      navigate(`/hotels/${item._id}`, { state: { search: searchState } });
      return;
    }

    navigate(`/hotels/${item._id}`);
  };

  return (
    <div
      className="searchItem relative border border-lightgray p-2.5 rounded-md flex justify-between gap-5 mb-5 cursor-pointer hover:shadow-md transition-shadow"
      onClick={openDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          openDetails();
        }
      }}
    >
      <img
        src={item.photos?.[0]}
        alt={item.name}
        className="siImg w-48 h-48 object-cover"
      />
      <SaveHotelButton
        hotelId={item._id}
        className="absolute left-4 top-4 h-9 w-9"
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
          <button
            className="siCheckButton bg-[#0071c2] text-white font-bold py-2.5 px-3 rounded-md border-none cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              openDetails();
            }}
          >
            See availability
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchItem;
