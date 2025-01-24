const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');

// @desc    create cash order
// @route   POST /api/v1/orders/cartId
// @access  Protected/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create order with default paymentMethodType cash
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: 'success', data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') req.filterObj = { user: req.user._id };
  next();
});
// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.findAllOrders = factory.getAll(Order);

// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.findSpecificOrder = factory.getOne(Order);

// @desc    Update order paid status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc    Update order delivered status
// @route   PUT /api/v1/orders/:id/deliver
// @access  Protected/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc    Get checkout session from stripe and send it as response
// @route   GET /api/v1/orders/checkout-session/cartId
// @access  Protected/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  const user = await User.findOne({ _id : request.user })



  
  const params = {
    submit_type : 'pay',
    mode : "payment",
    payment_method_types : ['card'],
    billing_address_collection : 'auto',
   
    customer_email : user.email,
    metadata : {
        userId : request.userId
    },
    line_items : cartItems.map((item,index)=>{
        return{
            price_data : {
              currency : 'EGP',
              product_data : {
                name : item.product,
            
                metadata : {
                    productId : item.productId._id
                }
              },
              unit_amount : totalOrderPrice * 100
            },
            adjustable_quantity : {
                enabled : true,
                minimum : 1
            },
            quantity : item. quantity

        }
    }),
    success_url : `${process.env.FRONTEND_URL}/success`,
    cancel_url : `${process.env.FRONTEND_URL}/cancel`,
}

const session = await stripe.checkout.sessions.create(params)

response.status(303).json(session)

});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const oderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // 3) Create order with default paymentMethodType card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: oderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: 'card',
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
    console.log("delete card")
  }
};

// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User

// exports.webhookCheckout = asyncHandler(async (req, res, next) => {
//   const sig = req.headers['stripe-signature'];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//     console.log('Webhook event constructed:', event.type);
//   } catch (err) {
//     console.error('Webhook signature verification failed:', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === 'checkout.session.completed') {
//     console.log('Payment completed! Processing order...');
//     try {
//       await createCardOrder(event.data.object);
//       console.log('Order created successfully.');
//     } catch (err) {
//       console.error('Error creating order:', err.message);
//     }
//   }

//   res.status(200).json({ received: true });
// });




async function getLIneItems(lineItems){
  let ProductItems = []

  if(lineItems?.data?.length){
      for(const item of lineItems.data){
          const product = await stripe.products.retrieve(item.price.product)
          const productId = product.metadata._id

          const productData = {
              productId : _id,
              name : product.title,
              price : item.price.unit_amount / 100,
              quantity : item.quantity,
              image : product.images
          }
          ProductItems.push(productData)
      }
  }

  return ProductItems
}

exports.webhookCheckout= async(request,response) => {
  const sig = request.headers['stripe-signature'];

  const payloadString = JSON.stringify(request.body)

  const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret : endpointSecret,
  });

  let event;

  try {
      event = stripe.webhooks.constructEvent(payloadString, header, endpointSecret);
  } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
  }


  // Handle the event
switch (event.type) {
  case 'checkout.session.completed':
    const session = event.data.object;

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    const productDetails = await getLIneItems(lineItems)

    const orderDetails = {
       productDetails : productDetails,
       email : session.customer_email,
       userId : session.metadata.userId,
       paymentDetails : {
          paymentId : session.payment_intent,
          payment_method_type : session.payment_method_types,
          payment_status : session.payment_status,
      },
     
   
      totalAmount : session.amount_total / 100
    }

  const order = new Order(orderDetails)
  const saveOrder = await order.save()

  if(saveOrder?._id){
      // const deleteCartItem = await addToCartModel.deleteMany({ userId : session.metadata.userId })
      await Cart.findByIdAndDelete(cartId);
      console.log("delete card")
  }
  break;

  // ... handle other event types
  default:
    console.log(`Unhandled event type ${event.type}`);
}

  response.status(200).send();
}

