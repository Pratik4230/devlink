import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use((err, req, res, next) => {
  if (err.code === "ECONNRESET") {
    console.error("Network error: Connection reset by peer", err);
    return res
      .status(503)
      .json({ message: "Service Unavailable, please try again later." });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// import routes
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import commentRoute from "./routes/comment.route.js";
import highlightRoute from "./routes/highlight.route.js";
import likeRoute from "./routes/like.route.js";
import connectionRoute from "./routes/connection.route.js";
import companyRoute from "./routes/company.route.js";
import followRoute from "./routes/follower.route.js";
import jobRoute from "./routes/job.route.js";
import jobApplicationRoute from "./routes/jobapplication.route.js";
import messageRoute from "./routes/conversation.route.js";

app.use("/user", userRoute);
app.use("/post", postRoute);
app.use("/comment", commentRoute);
app.use("/highlight", highlightRoute);
app.use("/like", likeRoute);
app.use("/connection", connectionRoute);
app.use("/company", companyRoute);
app.use("/follow", followRoute);
app.use("/job", jobRoute);
app.use("/jobapplication", jobApplicationRoute);
app.use("/message", messageRoute);

export default app;
