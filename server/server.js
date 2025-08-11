const express= require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config()
const routes = require('./routes/auth');
const app = express();
app.use(cors());
app.use(express.json())


async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI); // no callback
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

connectDB();

app.use('/api', routes);
app.listen(3000, () => {
    console.log("Server is running on port 3000");
})