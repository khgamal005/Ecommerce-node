const express = require("express");
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');




// Use body-parser middleware
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());

app.use(compression());

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
const wishlistRoute = require('./routes/wishlistRoute');
const addressRoute = require('./routes/addressRoute');
const couponRoute = require('./routes/couponRoute');
const cartRoute = require('./routes/cartRoute');
const orderRoute = require('./routes/orderRoute');
const { webhookCheckout } = require('./services/orderService')


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
app.use('/api/v1/wishlist', wishlistRoute);
app.use('/api/v1/addresses', addressRoute);
app.use('/api/v1/coupons', couponRoute);
app.use('/api/v1/cart', cartRoute);
app.use('/api/v1/orders', orderRoute);


app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  webhookCheckout
);
const PORT = 8080 || process.env.PORT
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
  