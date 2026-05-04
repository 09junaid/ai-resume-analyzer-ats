const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const interviewRouter = require("./routes/interview.routes");
const authRouter = require("./routes/auth.routes");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://ai-resume-analyzer-ats-nine.vercel.app/",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
/* using all routes here */
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
module.exports = app;
