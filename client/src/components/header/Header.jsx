import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faCalendarDays,
  faCar,
  faPerson,
  faPlane,
  faTaxi,
  faOtter,
} from "@fortawesome/free-solid-svg-icons";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const Header = ({ type }) => {
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [options, setOptions] = useState({
    adult: 1,
    children: 0,
    room: 1,
  });
  const [activeSection, setActiveSection] = useState("destination");

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { dispatch } = useContext(SearchContext);

  const handleOption = (name, operation) => {
    setOptions((prev) => ({
      ...prev,
      [name]: operation === "i" ? prev[name] + 1 : prev[name] - 1,
    }));
  };

  const handleSearch = () => {
    dispatch({ type: "NEW_SEARCH", payload: { destination, dates, options } });
    navigate("/hotels", { state: { destination, dates, options } });
  };

  const handleSignInRegister = () => {
    navigate("/login");
  };

  const handleSectionClick = (section, path) => {
    setActiveSection(section);
    navigate(path);
  };

  return (
    <div className="bg-[#003580] text-white flex justify-center relative">
      <div
        className={`w-full max-w-5xl mx-auto px-4 ${
          type === "list" ? "my-5" : "mt-5 mb-[100px]"
        }`}
      >
        {/* Content */}
        {type !== "list" && (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 text-center sm:text-left">
              A lifetime of discounts? It's Genius.
            </h1>
            <p className="text-sm sm:text-lg mb-4 sm:mb-6 text-center sm:text-left">
              Get rewarded for your travels - unlock instant savings of 10% or
              more with a free Mamabooking account
            </p>
            {!user && (
              <div className="flex justify-center sm:justify-start mb-4 sm:mb-6">
                <button
                  className="bg-[#0071c2] px-4 sm:px-6 py-2.5 font-medium rounded hover:bg-[#00487a] transition-colors text-sm sm:text-base"
                  onClick={handleSignInRegister}
                >
                  Sign in / Register
                </button>
              </div>
            )}

            {/* Search Bar */}
            <div className="absolute left-0 right-0 mx-2 sm:mx-4 -bottom-7 bg-white border-[3px] border-[#febb02] rounded-md shadow-lg">
              <div className="flex flex-col sm:flex-row flex-wrap items-center h-auto sm:h-14 p-2 sm:p-0 gap-2 sm:gap-0">
                {/* Destination Input */}
                <div
                  className={`flex items-center gap-2 px-3 sm:px-4 flex-1 min-w-[200px] sm:min-w-[260px] h-12 sm:h-full rounded ${
                    activeSection === "destination" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleSectionClick("destination", "/")}
                >
                  <FontAwesomeIcon icon={faBed} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    className="w-full bg-transparent text-gray-800 outline-none text-sm sm:text-base"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                {/* Date Selection */}
                <div
                  className={`flex items-center gap-2 px-3 sm:px-4 flex-1 min-w-[200px] sm:min-w-[260px] h-12 sm:h-full cursor-pointer rounded ${
                    activeSection === "date" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleSectionClick("date", "/")}
                >
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className="text-gray-400"
                  />
                  <span className="text-gray-600 text-sm sm:text-base">
                    {`${format(dates[0].startDate, "MM/dd/yyyy")} to ${format(
                      dates[0].endDate,
                      "MM/dd/yyyy"
                    )}`}
                  </span>
                  {activeSection === "date" && (
                    <div className="absolute top-20 sm:top-16 left-2 sm:left-auto sm:right-0 z-20">
                      <DateRange
                        editableDateInputs={true}
                        onChange={(item) => setDates([item.selection])}
                        moveRangeOnFirstSelection={false}
                        ranges={dates}
                        minDate={new Date()}
                        className="shadow-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Options Selection */}
                <div
                  className={`flex items-center gap-2 px-3 sm:px-4 flex-1 min-w-[200px] sm:min-w-[260px] h-12 sm:h-full cursor-pointer rounded ${
                    activeSection === "options" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleSectionClick("options", "/")}
                >
                  <FontAwesomeIcon icon={faPerson} className="text-gray-400" />
                  <span className="text-gray-600 text-sm sm:text-base">
                    {`${options.adult} adult · ${options.children} children · ${options.room} room`}
                  </span>
                  {activeSection === "options" && (
                    <div className="absolute top-20 sm:top-16 right-2 sm:right-0 bg-white rounded-lg shadow-lg p-4 z-20 w-[90vw] sm:w-auto">
                      {[
                        { type: "adult", min: 1 },
                        { type: "children", min: 0 },
                        { type: "room", min: 1 },
                      ].map((item) => (
                        <div
                          key={item.type}
                          className="flex justify-between items-center py-2 sm:py-3 border-b last:border-0"
                        >
                          <span className="text-gray-700 capitalize mr-4 sm:mr-8 text-sm sm:text-base">
                            {item.type}
                          </span>
                          <div className="flex items-center gap-2 sm:gap-4">
                            <button
                              disabled={options[item.type] <= item.min}
                              className="w-8 h-8 border border-[#0071c2] text-[#0071c2] rounded
                            disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0071c2] 
                            hover:text-white transition-colors text-sm sm:text-base"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOption(item.type, "d");
                              }}
                            >
                              -
                            </button>
                            <span className="text-gray-800 w-4 text-center text-sm sm:text-base">
                              {options[item.type]}
                            </span>
                            <button
                              className="w-8 h-8 border border-[#0071c2] text-[#0071c2] rounded
                            hover:bg-[#0071c2] hover:text-white transition-colors text-sm sm:text-base"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOption(item.type, "i");
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <div className="px-3 sm:px-4 w-full sm:w-auto">
                  <button
                    className="bg-[#0071c2] w-full sm:w-auto px-4 sm:px-6 py-2 text-white font-medium rounded hover:bg-[#00487a] transition-colors text-sm sm:text-base"
                    onClick={handleSearch}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
