const express = require("express");
const path = require('path');

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
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const reviewRoute = require('./routes/reviewRoute');


app.use(express.json())
app.use(express.static(path.join(__dirname, 'uploads')));

connectDB();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use("/api/v1/categories", categoryRoute);
app.use('/api/v1/subcategories', subCategoryRoute);
app.use('/api/v1/brands', brandRoute);
app.use('/api/v1/products', productRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/reviews', reviewRoute);

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
  