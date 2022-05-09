require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const router = require("./routers/userRouter");
const app = express();

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.LOGISTICS_APP_DB);
    console.log("Database Connection successful");
  } catch (e) {
    console.log(e);
  }
};

app.use(express.json());
app.use(router);

const PORT = 5000 || process.env.PORT;

// app.get("/api/v1/users/", (req, res, next) => {
//   res.json({ msg: "Hello World!" });
// });

app.listen(PORT, () => {
  dbConnection();
  console.log(`Server listening on port ${PORT}`);
});
