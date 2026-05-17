import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

const REVENUE_STATUSES = ["confirmed", "completed"];

const money = (value = 0) => Number(value || 0);

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const getRevenueSummary = async (dateMatch = {}) => {
  const [result] = await Booking.aggregate([
    {
      $match: {
        status: { $in: REVENUE_STATUSES },
        ...dateMatch,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
        bookings: { $sum: 1 },
      },
    },
  ]);

  return {
    revenue: money(result?.total),
    bookings: result?.bookings || 0,
  };
};

export const getAdminSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);

    const [
      users,
      hotels,
      rooms,
      bookings,
      roomNumberAggregate,
      totalRevenue,
      todayRevenue,
      thisMonthRevenue,
      lastWeekRevenue,
      lastMonthRevenue,
    ] = await Promise.all([
      User.countDocuments(),
      Hotel.countDocuments(),
      Room.countDocuments(),
      Booking.countDocuments(),
      Room.aggregate([
        {
          $project: {
            count: { $size: { $ifNull: ["$roomNumbers", []] } },
          },
        },
        { $group: { _id: null, total: { $sum: "$count" } } },
      ]),
      getRevenueSummary(),
      getRevenueSummary({ createdAt: { $gte: today, $lt: tomorrow } }),
      getRevenueSummary({ createdAt: { $gte: thisMonth } }),
      getRevenueSummary({ createdAt: { $gte: lastWeek, $lte: now } }),
      getRevenueSummary({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
    ]);

    res.status(200).json({
      totals: {
        users,
        hotels,
        rooms,
        roomNumbers: roomNumberAggregate[0]?.total || 0,
        bookings,
        revenue: totalRevenue.revenue,
      },
      today: todayRevenue,
      thisMonth: thisMonthRevenue,
      lastWeek: lastWeekRevenue,
      lastMonth: lastMonthRevenue,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminRevenue = async (req, res, next) => {
  try {
    const rawMonths = Number(req.query.months) || 6;
    const months = Math.min(Math.max(rawMonths, 1), 24);
    const now = new Date();
    const firstMonth = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const revenue = await Booking.aggregate([
      {
        $match: {
          status: { $in: REVENUE_STATUSES },
          createdAt: { $gte: firstMonth },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$totalPrice" },
          bookings: { $sum: 1 },
        },
      },
    ]);

    const revenueByMonth = new Map(
      revenue.map((item) => [
        `${item._id.year}-${item._id.month}`,
        { total: money(item.total), bookings: item.bookings || 0 },
      ])
    );

    const buckets = Array.from({ length: months }, (_, index) => {
      const date = new Date(
        firstMonth.getFullYear(),
        firstMonth.getMonth() + index,
        1
      );
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const result = revenueByMonth.get(key) || { total: 0, bookings: 0 };

      return {
        name: date.toLocaleString("en-US", { month: "short", year: "numeric" }),
        total: result.total,
        bookings: result.bookings,
      };
    });

    res.status(200).json(buckets);
  } catch (err) {
    next(err);
  }
};
