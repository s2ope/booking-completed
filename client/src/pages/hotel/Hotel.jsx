import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faCircleXmark,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

import { useContext, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";

import Reserve from "../../components/reserve/Reserve";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Swal from "sweetalert2";

const Hotel = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2];
  const [slideNumber, setSlideNumber] = useState(0);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const { data, loading, error } = useFetch(`/api/hotels/find/${id}`);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const { dates, options } = useContext(SearchContext);

  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

  function dayDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
    return diffDays;
  }

  const days =
    dates && dates[0] && dates[0].startDate && dates[0].endDate
      ? dayDifference(new Date(dates[0].endDate), new Date(dates[0].startDate))
      : 0;

  const handleOpen = (i) => {
    setSlideNumber(i);
    setOpen(true);
  };

  const handleMove = (direction) => {
    let newSlideNumber;

    if (direction === "l") {
      newSlideNumber = slideNumber === 0 ? 5 : slideNumber - 1;
    } else {
      newSlideNumber = slideNumber === 5 ? 0 : slideNumber + 1;
    }

    setSlideNumber(newSlideNumber);
  };
  const { id: hotelId } = useParams(); // If it's coming from the URL

  const handleClick = () => {
    if (user) {
      setOpenModal(true);
    } else {
      // Pass the current hotel ID to login page using state
      Swal.fire({
        icon: "warning",
        title: "You need to be logged in!",
        text: "Please log in to complete your booking.",
        showCancelButton: true,
        confirmButtonText: "Go to Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirect immediately after confirmation
          navigate("/login", { state: { from: `/hotels/${hotelId}` } });
        }
      });
      return;
    }
  };
  return (
    <div>
      <Navbar />
      <Header type="list" />
      {loading ? (
        "loading"
      ) : (
        <div className="flex flex-col items-center mt-5">
          {open && (
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
                  src={data.photos[slideNumber]}
                  alt="Hotel"
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

          <div className="w-full max-w-screen-lg flex flex-col gap-2 relative">
            <button
              onClick={handleClick}
              className="absolute top-2 right-0 px-5 py-2 bg-blue-600 text-white font-bold rounded-md cursor-pointer"
            >
              Reserve or Book Now!
            </button>
            <h1 className="text-2xl">{data.name}</h1>
            <div className="flex items-center gap-2 text-sm">
              <FontAwesomeIcon icon={faLocationDot} />
              <span>{data.address}</span>
            </div>
            <span className="text-blue-600 font-semibold">
              Excellent location – {data.distance}m from center
            </span>
            <span className="text-green-600 font-semibold">
              Book a stay over ${data.cheapestPrice} at this property and get a
              free airport taxi
            </span>
            <div className="grid grid-cols-3 gap-2 mt-5">
              {data.photos?.map((photo, i) => (
                <div key={i} className="w-full">
                  <img
                    onClick={() => handleOpen(i)}
                    src={photo}
                    alt="Hotel"
                    className="w-full object-cover cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between gap-5 mt-5">
              <div className="flex-3">
                <h1 className="text-2xl">{data.title}</h1>
                <p className="mt-5 text-sm">{data.desc}</p>
              </div>
              <div className="flex-1 bg-blue-50 p-5 flex flex-col gap-5">
                <h1 className="text-lg text-gray-700">
                  Perfect for a {days}-night stay!
                </h1>
                <span className="text-sm">
                  Located in the real heart of Krakow, this property has an
                  excellent location score of 9.8!
                </span>
                <h2 className="font-light text-lg">
                  <b>${days * data.cheapestPrice * options.room}</b> ({days}{" "}
                  nights)
                </h2>
                <button
                  onClick={handleClick}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-md cursor-pointer"
                >
                  Reserve or Book Now!
                </button>
              </div>
            </div>
          </div>
          <MailList />
        </div>
      )}
      {openModal && <Reserve setOpen={setOpenModal} hotelId={id} />}
    </div>
  );
};

export default Hotel;
