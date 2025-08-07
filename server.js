const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
// const adminRoutes = require("./routes/adminRoutes");
dotenv.config();

const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000', // allow localhost during dev
    credentials: true, // allow cookies if you're using them
  })
);
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/order");
const payment = require("./routes/payment");
const salesdata = require("./routes/salesdata");
// const orderRoutes = require("./routes/order");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// app.use("/api/admin", adminRoutes);

app.use("/api/products", productRoutes);

app.use("/api/users", userRoutes );

// app.use("/api/order", orderRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/payment", payment);

app.use("/api/admin", salesdata);


const PORT = process.env.PORT || 5000;

const cloudinary = require("./config/cloudinary");

cloudinary.api.ping()
  .then(res => console.log("✅ Cloudinary connected:", res))
  .catch(err => console.error("❌ Cloudinary error:", err));


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("BSCustoms API Running...");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
