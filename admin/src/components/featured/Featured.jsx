import "./featured.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";

const formatMoney = (value = 0) => `$${Number(value || 0).toLocaleString()}`;

const getProgress = (current = 0, previous = 0) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.min(Math.round((current / previous) * 100), 100);
};

const Featured = ({ summary, loading, error }) => {
  const todayRevenue = summary?.today?.revenue || 0;
  const thisMonthRevenue = summary?.thisMonth?.revenue || 0;
  const lastMonthRevenue = summary?.lastMonth?.revenue || 0;
  const lastWeekRevenue = summary?.lastWeek?.revenue || 0;
  const progress = getProgress(thisMonthRevenue, lastMonthRevenue);

  return (
    <div className="featured">
      <div className="top">
        <h1 className="title">Total Revenue</h1>
        <MoreVertIcon fontSize="small" />
      </div>
      <div className="bottom">
        {error ? (
          <p className="desc">Dashboard revenue is unavailable right now.</p>
        ) : (
          <>
            <div className="featuredChart">
              <CircularProgressbar
                value={progress}
                text={loading ? "..." : `${progress}%`}
                strokeWidth={5}
              />
            </div>
            <p className="title">Confirmed revenue today</p>
            <p className="amount">{loading ? "..." : formatMoney(todayRevenue)}</p>
            <p className="desc">
              Revenue includes confirmed and completed bookings only.
            </p>
          </>
        )}
        <div className="summary">
          <div className="item">
            <div className="itemTitle">This Month</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div className="resultAmount">
                {loading ? "..." : formatMoney(thisMonthRevenue)}
              </div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Week</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div className="resultAmount">
                {loading ? "..." : formatMoney(lastWeekRevenue)}
              </div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Month</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div className="resultAmount">
                {loading ? "..." : formatMoney(lastMonthRevenue)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
