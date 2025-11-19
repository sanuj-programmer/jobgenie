const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/profile", require("./routes/profile"));
app.use("/api/roles", require("./routes/roles"));
app.use("/api/match", require("./routes/match"));

app.get("/api", (req, res) => {
  res.send("API Working OK");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    app.listen(4000, () => console.log("Server running on port 4000"));
  })
  .catch(err => console.log("Mongo Error:", err));
