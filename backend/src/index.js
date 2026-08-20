const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const csrfGuard = require('./middleware/csrf');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(csrfGuard);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/roles", require("./routes/roles"));
app.use("/api/match", require("./routes/match"));

app.get("/api", (req, res) => {
  res.send("API Working OK");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.log("Mongo Error:", err));