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
        {/* Navigation List */}
        <div className="flex flex-wrap gap-8 mb-[50px]">
          {[
            { icon: faBed, text: "Stays", section: "destination", path: "/" },
            {
              icon: faPlane,
              text: "Flights",
              section: "flights",
              path: "/flights",
            },
            {
              icon: faCar,
              text: "Car rentals",
              section: "carRentals",
              path: "/carRentals",
            },
            {
              icon: faOtter,
              text: "Attractions",
              section: "attractions",
              path: "/attractions",
            },
            {
              icon: faTaxi,
              text: "Airport taxis",
              section: "airportTaxis",
              path: "/airportTaxis",
            },
          ].map((item) => (
            <div
              key={item.section}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${
                activeSection === item.section
                  ? "border border-white px-4 py-2 rounded-full"
                  : ""
              }`}
              onClick={() => handleSectionClick(item.section, item.path)}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        {type !== "list" && (
          <>
            <h1 className="text-3xl font-bold mb-4">
              A lifetime of discounts? It's Genius.
            </h1>
            <p className="text-lg mb-6">
              Get rewarded for your travels - unlock instant savings of 10% or
              more with a free Lamabooking account
            </p>
            {!user && (
              <button
                className="bg-[#0071c2] px-6 py-2.5 font-medium rounded hover:bg-[#00487a] transition-colors"
                onClick={handleSignInRegister}
              >
                Sign in / Register
              </button>
            )}

            {/* Search Bar */}
            <div className="absolute left-0 right-0 mx-4 -bottom-7 bg-white border-[3px] border-[#febb02] rounded-md">
              <div className="flex flex-wrap items-center h-14">
                {/* Destination Input */}
                <div
                  className={`flex items-center gap-2 px-4 flex-1 min-w-[260px] h-full
                    ${activeSection === "destination" ? "bg-gray-100" : ""}`}
                  onClick={() => handleSectionClick("destination", "/")}
                >
                  <FontAwesomeIcon icon={faBed} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    className="w-full bg-transparent text-gray-800 outline-none"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                {/* Date Selection */}
                <div
                  className={`flex items-center gap-2 px-4 flex-1 min-w-[260px] h-full cursor-pointer
                    ${activeSection === "date" ? "bg-gray-100" : ""}`}
                  onClick={() => handleSectionClick("date", "/")}
                >
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className="text-gray-400"
                  />
                  <span className="text-gray-600">
                    {`${format(dates[0].startDate, "MM/dd/yyyy")} to ${format(
                      dates[0].endDate,
                      "MM/dd/yyyy"
                    )}`}
                  </span>
                  {activeSection === "date" && (
                    <div className="absolute top-16 z-20">
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
                  className={`flex items-center gap-2 px-4 flex-1 min-w-[260px] h-full cursor-pointer
                    ${activeSection === "options" ? "bg-gray-100" : ""}`}
                  onClick={() => handleSectionClick("options", "/")}
                >
                  <FontAwesomeIcon icon={faPerson} className="text-gray-400" />
                  <span className="text-gray-600">
                    {`${options.adult} adult · ${options.children} children · ${options.room} room`}
                  </span>
                  {activeSection === "options" && (
                    <div className="absolute top-16 right-0 bg-white rounded-lg shadow-lg p-4 z-20">
                      {[
                        { type: "adult", min: 1 },
                        { type: "children", min: 0 },
                        { type: "room", min: 1 },
                      ].map((item) => (
                        <div
                          key={item.type}
                          className="flex justify-between items-center py-3 border-b last:border-0"
                        >
                          <span className="text-gray-700 capitalize mr-8">
                            {item.type}
                          </span>
                          <div className="flex items-center gap-4">
                            <button
                              disabled={options[item.type] <= item.min}
                              className="w-8 h-8 border border-[#0071c2] text-[#0071c2] rounded
                                disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0071c2] 
                                hover:text-white transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOption(item.type, "d");
                              }}
                            >
                              -
                            </button>
                            <span className="text-gray-800 w-4 text-center">
                              {options[item.type]}
                            </span>
                            <button
                              className="w-8 h-8 border border-[#0071c2] text-[#0071c2] rounded
                                hover:bg-[#0071c2] hover:text-white transition-colors"
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
                <div className="px-4">
                  <button
                    className="bg-[#0071c2] px-6 py-2 text-white font-medium rounded
                      hover:bg-[#00487a] transition-colors"
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
