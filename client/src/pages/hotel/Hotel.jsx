import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faCircleXmark,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

import { useContext, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import useFetch from "../../hooks/useFetch";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";

import Reserve from "../../components/reserve/Reserve";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import SaveHotelButton from "../../components/saveHotelButton/SaveHotelButton";

const Hotel = () => {
  const { id: hotelId } = useParams();
  const [slideNumber, setSlideNumber] = useState(0);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const { data, loading, error } = useFetch(`/hotels/find/${hotelId}`);
  const { user } = useContext(AuthContext);
  const {
    destination,
    dates: contextDates,
    options: contextOptions,
    filters,
  } = useContext(SearchContext);
  const location = useLocation();
  const navigate = useNavigate();

  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + 1);
  const defaultDates = [
    {
      startDate: new Date(),
      endDate: defaultEndDate,
      key: "selection",
    },
  ];
  const defaultOptions = { adult: 1, children: 0, room: 1 };
  const routeSearch = location.state?.search;
  const effectiveDates =
    routeSearch?.dates?.length > 0
      ? routeSearch.dates
      : contextDates?.length > 0
      ? contextDates
      : defaultDates;
  const effectiveOptions = routeSearch?.options || contextOptions || defaultOptions;
  const effectiveSearch = {
    destination: routeSearch?.destination ?? destination ?? "",
    dates: effectiveDates,
    options: effectiveOptions,
    filters: routeSearch?.filters || filters || {},
  };

  const photos = data?.photos || [];
  const roomCount = effectiveOptions?.room || 1;
  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

  const dayDifference = (date1, date2) =>
    Math.ceil(Math.abs(date2.getTime() - date1.getTime()) / MILLISECONDS_PER_DAY);

  const days =
    effectiveDates && effectiveDates[0] && effectiveDates[0].startDate && effectiveDates[0].endDate
      ? Math.max(
          dayDifference(
            new Date(effectiveDates[0].endDate),
            new Date(effectiveDates[0].startDate)
          ),
          1
        )
      : 1;

  const handleOpen = (i) => {
    setSlideNumber(i);
    setOpen(true);
  };

  const handleMove = (direction) => {
    if (!photos.length) return;

    if (direction === "l") {
      setSlideNumber(slideNumber === 0 ? photos.length - 1 : slideNumber - 1);
    } else {
      setSlideNumber(slideNumber === photos.length - 1 ? 0 : slideNumber + 1);
    }
  };

  const handleClick = () => {
    if (user) {
      setOpenModal(true);
      return;
    }

    Swal.fire({
      icon: "warning",
      title: "You need to be logged in!",
      text: "Please log in to complete your booking.",
      showCancelButton: true,
      confirmButtonText: "Go to Login",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login", { state: { from: `/hotels/${hotelId}` } });
      }
    });
  };

  return (
    <div>
      <Navbar />
      <Header type="list" />
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading hotel...</div>
      ) : error || !data?._id ? (
        <div className="text-center text-red-500 py-12">
          Hotel details could not be loaded.
        </div>
      ) : (
        <div className="flex flex-col items-center mt-5">
          {open && photos.length > 0 && (
            <div className="fixed top-0 left-0 w-full h-screen bg-black bg-opacity-60 z-50 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faCircleXmark}
                className="absolute top-5 right-5 text-lightgray text-3xl cursor-pointer"
                onClick={() => setOpen(false)}
              />
              <FontAwesomeIcon
                icon={faCircleArrowLeft}
                className="text-lightgray text-5xl cursor-pointer"
                onClick={() => handleMove("l")}
              />
              <div className="flex justify-center items-center w-full h-full">
                <img
                  src={photos[slideNumber]}
                  alt={data.name}
                  className="w-4/5 h-[80vh] object-cover"
                />
              </div>
              <FontAwesomeIcon
                icon={faCircleArrowRight}
                className="text-lightgray text-5xl cursor-pointer"
                onClick={() => handleMove("r")}
              />
            </div>
          )}

          <div className="w-full max-w-screen-lg flex flex-col gap-2 relative px-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold">{data.name}</h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  <SaveHotelButton
                    hotelId={hotelId}
                    label
                    className="px-4 py-2 text-sm font-medium"
                  />
                  <button
                    onClick={handleClick}
                    className="px-5 py-2 bg-blue-600 text-white font-bold rounded-md cursor-pointer hover:bg-blue-700"
                  >
                    Reserve or Book Now!
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FontAwesomeIcon icon={faLocationDot} />
              <span>{data.address}</span>
            </div>
            <span className="text-blue-600 font-semibold">
              Excellent location - {data.distance}m from center
            </span>
            <span className="text-green-600 font-semibold">
              Book a stay over ${data.cheapestPrice} at this property and get a
              free airport taxi
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-5">
              {photos.map((photo, i) => (
                <div key={photo} className="w-full">
                  <img
                    onClick={() => handleOpen(i)}
                    src={photo}
                    alt={data.name}
                    className="w-full h-56 object-cover cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-5 mt-5">
              <div className="flex-[3]">
                <h1 className="text-2xl">{data.title}</h1>
                <p className="mt-5 text-sm">{data.desc}</p>
              </div>
              <div className="flex-1 bg-blue-50 p-5 flex flex-col gap-5 rounded-md">
                <h1 className="text-lg text-gray-700">
                  Perfect for a {days}-night stay!
                </h1>
                <span className="text-sm">
                  Located in {data.city || "a popular destination"}, this stay
                  is ready for your selected dates.
                </span>
                <h2 className="font-light text-lg">
                  <b>${days * (data.cheapestPrice || 0) * roomCount}</b> ({days}{" "}
                  nights, {roomCount} room{roomCount > 1 ? "s" : ""})
                </h2>
                <button
                  onClick={handleClick}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-md cursor-pointer hover:bg-blue-700"
                >
                  Reserve or Book Now!
                </button>
              </div>
            </div>
          </div>
          <MailList />
        </div>
      )}
      {openModal && (
        <Reserve
          setOpen={setOpenModal}
          hotelId={hotelId}
          searchState={effectiveSearch}
        />
      )}
    </div>
  );
};

export default Hotel;
