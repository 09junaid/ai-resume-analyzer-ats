const mongoose = require("mongoose");

let cachedConnectionPromise = null;

async function connectToDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then((connection) => {
        console.log("Connected to Database");
        return connection;
      })
      .catch((error) => {
        cachedConnectionPromise = null;
        throw error;
      });
  }

  return cachedConnectionPromise;
}

module.exports = connectToDB;
