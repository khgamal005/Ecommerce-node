const mongoose = require("mongoose")

const connectDB = () => {
    mongoose
      .connect(process.env.MONGODB_URI)
      .then((conn) => {
        console.log(`Database Connected: `);
      })
      // .catch((err) => {
      //   console.error(`Database Error: ${err}`);
      //   process.exit(1);
      // });
  };

module.exports = connectDB



// const { MongoClient } = require('mongodb');
// // or as an es module:

// // Connection URL
// const url = 'mongodb+srv://khgamal005:node123@codezone.my4oc.mongodb.net/?retryWrites=true&w=majority&appName=codezone';
// const client = new MongoClient(url);

// // Database Name
// const dbName = 'codezone';
// async function main() {
//     // Use connect method to connect to the server
//     await client.connect();
//     console.log('Connected successfully to server');
//     const db = client.db(dbName);
//     const collection = db.collection('courses');
  



//   }
// main()