const express = require("express");
const app = express();
require("dotenv").config();
const morgan = require("morgan");
const connectDB = require("./config/db");
const categoryRoute = require("./routes/categoryRoute");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");

app.use(express.json())


if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use("/api/v1/categories", categoryRoute);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

const PORT = process.env.PORT;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running " + PORT);
  });
});
