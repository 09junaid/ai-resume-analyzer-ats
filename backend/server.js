require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");

async function handler(req, res) {
  await connectToDB();
  return app(req, res);
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;

  connectToDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`server is running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server", error);
      process.exit(1);
    });
}

module.exports = handler;
