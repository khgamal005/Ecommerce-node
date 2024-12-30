const express = require("express");

const app = express();
require("dotenv").config();
const morgan = require("morgan");
const connectDB = require("./config/db");
const categoryRoute = require("./routes/categoryRoute");
const subCategoryRoute = require('./routes/subCategoryRoute');
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const brandRoute = require('./routes/brandRoute');
const productRoute = require('./routes/productRoute');


app.use(express.json())

connectDB();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use("/api/v1/categories", categoryRoute);
app.use('/api/v1/subcategories', subCategoryRoute);
app.use('/api/v1/brands', brandRoute);
app.use('/api/v1/products', productRoute);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

const {PORT} = process.env;
const server = 
  app.listen(PORT, () => {
    console.log(`Server is running ${  PORT}`);
  });


process.on('unhandledRejection', (err) => {
    console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
    server.close(() => {
      console.error(`Shutting down....`);
      process.exit(1);
    });
  });
  