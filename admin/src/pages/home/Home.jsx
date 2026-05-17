import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./home.scss";
import Widget from "../../components/widget/Widget";
import Featured from "../../components/featured/Featured";
import Chart from "../../components/chart/Chart";
import useFetch from "../../hooks/useFetch";

const Home = () => {
  const { data: summary, loading, error } = useFetch("/admin/summary");
  const totals = summary?.totals || {};

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="widgets">
          <Widget type="users" amount={totals.users} loading={loading} />
          <Widget type="hotels" amount={totals.hotels} loading={loading} />
          <Widget type="rooms" amount={totals.roomNumbers || totals.rooms} loading={loading} />
          <Widget type="revenue" amount={totals.revenue} loading={loading} />
        </div>
        <div className="charts">
          <Featured summary={summary} loading={loading} error={error} />
          <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
        </div>
      </div>
    </div>
  );
};

export default Home;
