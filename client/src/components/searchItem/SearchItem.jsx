import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import SaveHotelButton from "../saveHotelButton/SaveHotelButton";
import { SearchContext } from "../../context/SearchContext";
import { trackClarityEvent } from "../../utils/clarity";

const SearchItem = ({ item, searchState }) => {
  const navigate = useNavigate();
  const { dispatch } = useContext(SearchContext);

  const trackOpenDetails = (source) => {
    trackClarityEvent(
      "property_details_opened",
      {
        clarity_open_source: source,
        clarity_hotel_id: item._id,
        clarity_price_per_night: item.cheapestPrice || "unknown",
        clarity_rating_available: Boolean(item.rating),
        clarity_search_context_available: Boolean(searchState),
      },
      source === "see_availability" ? "booking intent" : undefined,
    );
  };

  const openDetails = (source = "property_card") => {
    trackOpenDetails(source);

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
      onClick={() => openDetails("property_card")}
      role="button"
      tabIndex={0}
      data-clarity-event="property_card_click"
      data-clarity-label="Property card"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          openDetails("property_card_keyboard");
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
            data-clarity-event="see_availability_click"
            data-clarity-label="See availability"
            data-clarity-upgrade="booking intent"
            onClick={(event) => {
              event.stopPropagation();
              openDetails("see_availability");
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
