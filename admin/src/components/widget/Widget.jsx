import "./widget.scss";
import { Link } from "react-router-dom";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";

const formatValue = (value, isMoney) => {
  if (value === undefined || value === null) return "0";
  const number = Number(value) || 0;
  return isMoney
    ? `$${number.toLocaleString()}`
    : number.toLocaleString();
};

const Widget = ({ type, amount = 0, loading = false }) => {
  let data;

  switch (type) {
    case "users":
      data = {
        title: "USERS",
        isMoney: false,
        link: "See all users",
        to: "/users",
        icon: (
          <PersonOutlinedIcon
            className="icon"
            style={{
              color: "crimson",
              backgroundColor: "rgba(255, 0, 0, 0.2)",
            }}
          />
        ),
      };
      break;
    case "hotels":
      data = {
        title: "HOTELS",
        isMoney: false,
        link: "See all hotels",
        to: "/hotels",
        icon: (
          <StoreOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(218, 165, 32, 0.2)",
              color: "goldenrod",
            }}
          />
        ),
      };
      break;
    case "rooms":
      data = {
        title: "ROOMS",
        isMoney: false,
        link: "See all rooms",
        to: "/rooms",
        icon: (
          <MeetingRoomOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(128, 0, 128, 0.2)",
              color: "purple",
            }}
          />
        ),
      };
      break;
    case "revenue":
      data = {
        title: "REVENUE",
        isMoney: true,
        link: "Confirmed bookings",
        icon: (
          <MonetizationOnOutlinedIcon
            className="icon"
            style={{ backgroundColor: "rgba(0, 128, 0, 0.2)", color: "green" }}
          />
        ),
      };
      break;
    default:
      break;
  }

  if (!data) return null;

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">{loading ? "..." : formatValue(amount, data.isMoney)}</span>
        {data.to ? (
          <Link to={data.to} className="link">
            {data.link}
          </Link>
        ) : (
          <span className="link">{data.link}</span>
        )}
      </div>
      <div className="right">
        <div className="percentage neutral">Live</div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
