//const morgan = require("morgan")
const express = require("express");
const cors = require("cors");
const connectToOracleDB = require('./connectToOracleDB');
const blogRoute = require("./routes/blog");

const app = express();

// เรียกใช้ฟังก์ชันเชื่อมต่อ OracleDB
connectToOracleDB();

// Middleware
app.use(express.json());
app.use(cors());

// Route
app.use("/api", blogRoute);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));