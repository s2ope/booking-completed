import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import SearchItem from "../../components/searchItem/SearchItem";
import useFetch from "../../hooks/useFetch";
import { showToast } from "../../helpers/ToastHelper";

const List = () => {
  const location = useLocation();
  const { destination, dates, options } = location.state || {
    destination: "",
    dates: [{ startDate: new Date(), endDate: new Date() }],
    options: { adult: 1, children: 0, room: 1 },
  };

  const [searchDestination, setSearchDestination] = useState(destination);
  const [searchDates, setSearchDates] = useState(dates);
  const [openDate, setOpenDate] = useState(false);
  const [searchOptions, setSearchOptions] = useState(options);
  const [min, setMin] = useState(undefined);
  const [max, setMax] = useState(undefined);

  const { data, loading, error, reFetch } = useFetch(
    `/api/hotels?city=${searchDestination}&min=${min || 0}&max=${max || 999}`
  );

  useEffect(() => {
    setSearchDestination(destination);
    setSearchDates(dates);
    setSearchOptions(options);
  }, [destination, dates, options]);

  const validateSearch = () => {
    if (max && min && Number(max) < Number(min)) {
      showToast("Maximum price cannot be less than minimum price", "error");
      return false;
    }
    if (searchOptions.adult < 1) {
      showToast("At least one adult is required", "error");
      return false;
    }
    if (searchOptions.room < 1) {
      showToast("At least one room is required", "error");
      return false;
    }
    return true;
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault(); // Prevent form submission if it's from a form

    if (!validateSearch()) return;

    try {
      await reFetch();
      if (data.length === 0) {
        showToast("No hotels found matching your criteria", "info");
      } else {
        showToast(
          `Found ${data.length} hotels matching your criteria`,
          "success"
        );
      }
    } catch (err) {
      showToast("Error searching for hotels. Please try again.", "error");
    }
  };

  const handleOptionChange = (optionType, value) => {
    // Convert value to number
    const numValue = Number(value);

    if (numValue < 0) {
      showToast("Value cannot be negative", "warning");
      return;
    }

    setSearchOptions({
      ...searchOptions,
      [optionType]: numValue,
    });
  };

  // Handle price input changes
  const handlePriceChange = (setter) => (e) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, "");
    setter(value === "" ? undefined : Number(value));
  };

  const OptionInput = ({ label, value, onChange, min = 0, helpText }) => (
    <div className="flex justify-between items-center mb-2.5 text-gray-600 text-xs">
      <span className="flex flex-col">
        {label}
        {helpText && <small className="text-gray-500">{helpText}</small>}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="w-6 h-6 border border-gray-300 bg-white text-gray-600 rounded flex items-center justify-center cursor-pointer disabled:opacity-50"
          onClick={() => {
            if (value > min) onChange(value - 1);
          }}
          disabled={value <= min}
        >
          -
        </button>
        <span className="w-8 text-center">{value}</span>
        <button
          type="button"
          className="w-6 h-6 border border-gray-300 bg-white text-gray-600 rounded flex items-center justify-center cursor-pointer"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Header type="list" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-80 flex-shrink-0">
            <div className="bg-yellow-500 rounded-lg shadow-md p-4 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Search
              </h2>

              <form onSubmit={handleSearch}>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">
                    Destination
                  </label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Where are you going?"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">
                    Check-in Date
                  </label>
                  <button
                    type="button" // Important to prevent form submission
                    className="w-full p-2 bg-white border border-gray-300 rounded text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setOpenDate(!openDate)}
                  >
                    {`${format(
                      searchDates[0].startDate,
                      "MM/dd/yyyy"
                    )} to ${format(searchDates[0].endDate, "MM/dd/yyyy")}`}
                  </button>
                  {openDate && (
                    <div className="mt-2 relative z-10">
                      <DateRange
                        onChange={(item) => setSearchDates([item.selection])}
                        minDate={new Date()}
                        ranges={searchDates}
                        className="border border-gray-300 rounded shadow-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-sm text-gray-600 mb-2">Options</h3>
                  <div className="bg-white rounded p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        Min price{" "}
                        <small className="text-gray-500">(per night)</small>
                      </span>
                      <input
                        type="text"
                        className="w-16 p-1 border border-gray-300 rounded text-right"
                        placeholder="$"
                        value={min || ""}
                        onChange={handlePriceChange(setMin)}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        Max price{" "}
                        <small className="text-gray-500">(per night)</small>
                      </span>
                      <input
                        type="text"
                        className="w-16 p-1 border border-gray-300 rounded text-right"
                        placeholder="$"
                        value={max || ""}
                        onChange={handlePriceChange(setMax)}
                      />
                    </div>

                    <OptionInput
                      label="Adults"
                      value={searchOptions.adult}
                      min={1}
                      onChange={(value) => handleOptionChange("adult", value)}
                    />
                    <OptionInput
                      label="Children"
                      value={searchOptions.children}
                      onChange={(value) =>
                        handleOptionChange("children", value)
                      }
                    />
                    <OptionInput
                      label="Rooms"
                      value={searchOptions.room}
                      min={1}
                      onChange={(value) => handleOptionChange("room", value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </form>
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                <p>Error loading hotels. Please try again.</p>
                {showToast("Error loading hotels. Please try again.", "error")}
              </div>
            ) : (
              <div className="space-y-4">
                {data && data.length > 0 ? (
                  data.map((item) => <SearchItem key={item._id} item={item} />)
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hotels found. Try adjusting your search criteria.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default List;
