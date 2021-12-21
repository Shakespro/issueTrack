require("dotenv").config();
const { MongoClient } = require("mongodb");

module.exports = async function (callback) {
   const client = new MongoClient(process.env.MONGO_URI);
   try {
      await client.connect();
      const db = client.db("freeCodeCamp");
      callback(db);
   } catch (e) {
      console.log(e);
      throw new Error("Unable to connect to database");
   }
};
