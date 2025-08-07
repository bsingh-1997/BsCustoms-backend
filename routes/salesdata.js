// // routes/admin.js
// const express = require("express");
// const Order = require("../models/Order");
// const authMiddleware = require("../middlewares/authMiddleware");
// const router = express.Router();



// // routes/admin.js
// router.get("/dashboard", authMiddleware, async (req, res) => {
//   try {
//     const now = new Date();

//     const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//     const [todayOrders, weekOrders, monthOrders] = await Promise.all([
//       Order.find({ createdAt: { $gte: startOfToday } }),
//       Order.find({ createdAt: { $gte: startOfWeek } }),
//       Order.find({ createdAt: { $gte: startOfMonth } }),
//     ]);

//     const calculateTotal = (orders) =>
//       orders.reduce((sum, order) => sum + order.totalPrice, 0);

//     // 📊 Build chart data for this month
//     const dailySalesMap = {};

//     monthOrders.forEach(order => {
//       const day = order.createdAt.toISOString().slice(0, 10); // "YYYY-MM-DD"
//       if (!dailySalesMap[day]) {
//         dailySalesMap[day] = 0;
//       }
//       dailySalesMap[day] += order.totalPrice;
//     });

//     const chartData = Object.keys(dailySalesMap).map(day => ({
//       day,
//       total: dailySalesMap[day]
//     })).sort((a, b) => new Date(a.day) - new Date(b.day));

//     res.json({
//       today: {
//         orders: todayOrders.length,
//         sales: calculateTotal(todayOrders),
//       },
//       thisWeek: {
//         orders: weekOrders.length,
//         sales: calculateTotal(weekOrders),
//       },
//       thisMonth: {
//         orders: monthOrders.length,
//         sales: calculateTotal(monthOrders),
//       },
//       chartData,
//     });
//     console.log( {today: {
//         orders: todayOrders.length,
//         sales: calculateTotal(todayOrders),
//       },
//       thisWeek: {
//         orders: weekOrders.length,
//         sales: calculateTotal(weekOrders),
//       },
//       thisMonth: {
//         orders: monthOrders.length,
//         sales: calculateTotal(monthOrders),
//       },
//       chartData,})

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error calculating sales summary' });
//   }
// });

// // });

// module.exports = router;



// working code
// working code
// const express = require("express");
// const router = express.Router();
// // const Order = require("../models/Order"); // Adjust path if needed
// const Order = require("../models/Order"); // Adjust path if needed
// const authMiddleware = require("../middlewares/authMiddleware");

// router.get("/sales-data", authMiddleware, async (req, res) => {
//   try {
//     // OPTIONAL: if you want only admin access
//     // if (!req.user.isAdmin) return res.status(403).json({ msg: "Unauthorized" });

//     const now = new Date();

//     const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//     const [todayOrders, weekOrders, monthOrders] = await Promise.all([
//       Order.find({ placedAt: { $gte: startOfToday } }),
//       Order.find({ placedAt: { $gte: startOfWeek } }),
//       Order.find({ placedAt: { $gte: startOfMonth } }),
//     ]);

//     const calculateTotal = (orders) => orders.reduce((sum, order) => sum + order.totalAmount, 0);

//     const dailySalesMap = {};
//     monthOrders.forEach(order => {
//       const day = order.placedAt.toISOString().slice(0, 10); // YYYY-MM-DD
//       if (!dailySalesMap[day]) dailySalesMap[day] = 0;
//       dailySalesMap[day] += order.totalAmount;
//     });

//     const chartData = Object.entries(dailySalesMap).map(([day, total]) => ({ day, total }));

//     res.json({
//       today: {
//         orders: todayOrders.length,
//         sales: calculateTotal(todayOrders),
//       },
//       thisWeek: {
//         orders: weekOrders.length,
//         sales: calculateTotal(weekOrders),
//       },
//       thisMonth: {
//         orders: monthOrders.length,
//         sales: calculateTotal(monthOrders),
//       },
//       chartData,
//     });
//   } catch (error) {
//     console.error("Sales Data Error:", error);
//     res.status(500).json({ message: "Error fetching sales data" });
//   }
// });

// module.exports = router;






// const express = require("express");
// const Order = require("../models/Order");
// const authMiddleware = require("../middlewares/authMiddleware");
// const router = express.Router();

// router.get("/sales-data", authMiddleware, async (req, res) => {
//   try {
//     const now = new Date();
//     const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//     // Fetch all orders this month
//     const monthOrders = await Order.find({ placedAt: { $gte: startOfMonth } });

//     // === SALES TOTALS ===
//     const todayOrders = monthOrders.filter(order => order.placedAt >= startOfToday);
//     const weekOrders = monthOrders.filter(order => order.placedAt >= startOfWeek);

//     const calculateTotal = (orders) =>
//       orders.reduce((sum, order) => sum + order.totalAmount, 0);

//     // === DAILY SALES FOR LINE CHART ===
//     const dailySalesMap = {};
//     for (let order of monthOrders) {
//       const date = order.placedAt.toISOString().split("T")[0]; // yyyy-mm-dd
//       dailySalesMap[date] = (dailySalesMap[date] || 0) + order.totalAmount;
//     }
//     const chartData = Object.keys(dailySalesMap)
//       .map(date => ({ day: date, total: dailySalesMap[date] }))
//       .sort((a, b) => new Date(a.day) - new Date(b.day));

//     // === WEEKLY SALES FOR BAR CHART ===
//     const weekSalesMap = Array(7).fill(0); // Sunday = 0, Monday = 1, ...
//     for (let order of monthOrders) {
//       const dayOfWeek = new Date(order.placedAt).getDay();
//       weekSalesMap[dayOfWeek] += order.totalAmount;
//     }
//     const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//     const weeklyChartData = weekSalesMap.map((total, i) => ({
//       day: weekDayLabels[i],
//       total,
//     }));

//     // === ORDER STATUS PIE CHART ===
//     const statusCount = { Pending: 0, Confirmed: 0, Cancelled: 0 };
//     for (let order of monthOrders) {
//       statusCount[order.status] = (statusCount[order.status] || 0) + 1;
//     }
//     const statusChartData = Object.keys(statusCount).map(status => ({
//       name: status,
//       value: statusCount[status],
//     }));

//     res.json({
//       today: {
//         orders: todayOrders.length,
//         sales: calculateTotal(todayOrders),
//       },
//       thisWeek: {
//         orders: weekOrders.length,
//         sales: calculateTotal(weekOrders),
//       },
//       thisMonth: {
//         orders: monthOrders.length,
//         sales: calculateTotal(monthOrders),
//       },
//       chartData,           // daily sales
//       weeklyChartData,     // bar chart
//       statusChartData      // pie chart
//     });

//   } catch (error) {
//     console.error("Sales data error:", error);
//     res.status(500).json({ message: "Failed to fetch sales data" });
//   }
// });

// module.exports = router;




// const express = require("express");
// const router = express.Router();
// const Order = require("../models/Order");
// const authMiddleware = require("../middlewares/authMiddleware");

// router.get("/sales-data", authMiddleware, async (req, res) => {
//   try {
//     // const now = new Date();

//     // const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     // const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
//     // const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//     // const allOrders = await Order.find();
//     // const todayOrders = await Order.find({ placedAt: { $gte: startOfToday } });
//     // const weekOrders = await Order.find({ placedAt: { $gte: startOfWeek } });
//     // const monthOrders = await Order.find({ placedAt: { $gte: startOfMonth } });


//     const now = new Date();

// const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
// startOfToday.setHours(0, 0, 0, 0);

// const startOfWeek = new Date(now);
// const day = startOfWeek.getDay();
// const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
// startOfWeek.setDate(diff);
// startOfWeek.setHours(0, 0, 0, 0);

// const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
// startOfMonth.setHours(0, 0, 0, 0);

//     const allOrders = await Order.find();
//     const todayOrders = await Order.find({ placedAt: { $gte: startOfToday } });
//     const weekOrders = await Order.find({ placedAt: { $gte: startOfWeek } });
//     const monthOrders = await Order.find({ placedAt: { $gte: startOfMonth } });



//     const calculateTotal = (orders) =>
//       orders.reduce((sum, order) => sum + order.totalAmount, 0);

//     // Chart data: daily sales in this month
//     const dailyMap = {};
//     monthOrders.forEach(order => {
//       const day = order.placedAt.toISOString().slice(0, 10); // YYYY-MM-DD
//       dailyMap[day] = (dailyMap[day] || 0) + order.totalAmount;
//     });

//     const chartData = Object.entries(dailyMap).map(([day, total]) => ({
//       day, total
//     }));

//     // Bar chart: weekly data (Mon to Sun)
//     const weeklyMap = {};
//     weekOrders.forEach(order => {
//       const day = new Date(order.placedAt).toLocaleDateString("en-US", { weekday: "short" });
//       weeklyMap[day] = (weeklyMap[day] || 0) + order.totalAmount;
//     });

//     const weeklyChartData = Object.entries(weeklyMap).map(([day, total]) => ({
//       day, total
//     }));

//     // Pie chart: status breakdown
//     const statusCounts = { Pending: 0, Confirmed: 0, Cancelled: 0 };
//     allOrders.forEach(order => {
//       statusCounts[order.status] += 1;
//     });

//     const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({
//       name, value
//     }));

//     res.json({
//       today: {
//         orders: todayOrders.length,
//         sales: calculateTotal(todayOrders),
//       },
//       thisWeek: {
//         orders: weekOrders.length,
//         sales: calculateTotal(weekOrders),
//       },
//       thisMonth: {
//         orders: monthOrders.length,
//         sales: calculateTotal(monthOrders),
//       },
//       chartData,
//       weeklyChartData,
//       statusChartData,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch sales data" });
//   }
// });

// module.exports = router;



// const express = require("express");
// const router = express.Router();
// const Order = require("../models/Order");
// const authMiddleware = require("../middlewares/authMiddleware");

// router.get("/sales-data", authMiddleware, async (req, res) => {
//   try {
//     const now = new Date();

//     const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//     const startOfWeek = new Date(now);
//     const day = startOfWeek.getDay();
//     const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
//     startOfWeek.setDate(diff);
//     startOfWeek.setHours(0, 0, 0, 0);

//     const [todayOrders, weekOrders, monthOrders] = await Promise.all([
//       Order.find({ placedAt: { $gte: startOfToday } }),
//       Order.find({ placedAt: { $gte: startOfWeek } }),
//       Order.find({ placedAt: { $gte: startOfMonth } }),
//     ]);

//     const calculateTotal = (orders) =>
//       orders.reduce((sum, order) => sum + order.totalAmount, 0);

//     // ✅ Monthly daily sales chart
//     const dailySalesMap = {};
//     monthOrders.forEach(order => {
//       const day = order.placedAt.toISOString().slice(0, 10); // "YYYY-MM-DD"
//       if (!dailySalesMap[day]) dailySalesMap[day] = 0;
//       dailySalesMap[day] += order.totalAmount;
//     });
//     const chartData = Object.entries(dailySalesMap).map(([day, total]) => ({ day, total }));

//     // ✅ Weekly chart by day name (Monday to Sunday)
//     const weekDaySalesMap = {
//       Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0,
//       Friday: 0, Saturday: 0, Sunday: 0
//     };
//     const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

//     weekOrders.forEach(order => {
//       const dayName = weekDays[order.placedAt.getDay()];
//       weekDaySalesMap[dayName] += order.totalAmount;
//     });

//     const weeklyChartData = Object.entries(weekDaySalesMap).map(([day, total]) => ({ day, total }));

//     res.json({
//       today: {
//         orders: todayOrders.length,
//         sales: calculateTotal(todayOrders),
//       },
//       thisWeek: {
//         orders: weekOrders.length,
//         sales: calculateTotal(weekOrders),
//       },
//       thisMonth: {
//         orders: monthOrders.length,
//         sales: calculateTotal(monthOrders),
//       },
//       chartData,
//       weeklyChartData
//     });

//   } catch (error) {
//     console.error("Sales data fetch error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/sales-data", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayOrders, weekOrders, monthOrders, allOrders] = await Promise.all([
      Order.find({ placedAt: { $gte: startOfToday } }),
      Order.find({ placedAt: { $gte: startOfWeek } }),
      Order.find({ placedAt: { $gte: startOfMonth } }),
      Order.find(),
    ]);

    const calculateTotal = (orders) =>
      orders.reduce((sum, order) => sum + order.totalAmount, 0);

    const dailySalesMap = {};
    monthOrders.forEach(order => {
      const day = order.placedAt.toISOString().slice(0, 10); // "YYYY-MM-DD"
      dailySalesMap[day] = (dailySalesMap[day] || 0) + order.totalAmount;
    });

    const dailySalesData = Object.keys(dailySalesMap).map(day => ({
      day,
      total: dailySalesMap[day]
    })).sort((a, b) => new Date(a.day) - new Date(b.day));

    // Weekly bar chart (Mon - Sun)
    const weeklySalesMap = {};
    weekOrders.forEach(order => {
      const day = order.placedAt.toLocaleDateString('en-US', { weekday: 'short' });
      weeklySalesMap[day] = (weeklySalesMap[day] || 0) + order.totalAmount;
    });
    const allWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyChartData = allWeekdays.map(day => ({
      day,
      total: weeklySalesMap[day] || 0
    }));


    // todays
    const hourlySalesMap = {};
todayOrders.forEach(order => {
  const hour = order.placedAt.getHours(); // 0–23
  hourlySalesMap[hour] = (hourlySalesMap[hour] || 0) + order.totalAmount;
});
const todayBarChartData = Array.from({ length: 24 }, (_, hour) => ({
  hour: `${hour}:00`,
  total: hourlySalesMap[hour] || 0
}));


    // Pie chart data for order status
    const statusMap = { Pending: 0, Confirmed: 0, Cancelled: 0 };
    allOrders.forEach(order => {
      statusMap[order.status] = (statusMap[order.status] || 0) + 1;
    });
    const statusPieData = Object.keys(statusMap).map(status => ({
      name: status,
      value: statusMap[status]
    }));

    // res.json({
    //   today: {
    //     orders: todayOrders.length,
    //     sales: calculateTotal(todayOrders),
    //   },
    //   thisWeek: {
    //     orders: weekOrders.length,
    //     sales: calculateTotal(weekOrders),
    //   },
    //   thisMonth: {
    //     orders: monthOrders.length,
    //     sales: calculateTotal(monthOrders),
    //   },
    //   lineChartData: dailySalesData,
    //   barChartData: {
    //     today: calculateTotal(todayOrders),
    //     thisWeek: weeklyChartData,
    //     thisMonth: calculateTotal(monthOrders),
    //   },
    //   pieChartData: statusPieData,
    // });
    res.json({
  today: {
    orders: todayOrders.length,
    sales: calculateTotal(todayOrders),
  },
  thisWeek: {
    orders: weekOrders.length,
    sales: calculateTotal(weekOrders),
  },
  thisMonth: {
    orders: monthOrders.length,
    sales: calculateTotal(monthOrders),
  },
  lineChartData: dailySalesData,
  barChartData: {
    today: todayBarChartData, // now includes hourly data
    thisWeek: weeklyChartData,
    thisMonth: calculateTotal(monthOrders),
  },
  pieChartData: statusPieData,
});


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating sales dashboard data' });
  }
});

module.exports = router;
