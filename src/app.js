import express from "express";
import cookieParser from "cookie-parser";

const app = express();

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

app.use("/user", userRoute);
app.use("/post", postRoute);
app.use("/comment", commentRoute);
app.use("/highlight", highlightRoute);
app.use("/like", likeRoute);
app.use("/connection", connectionRoute);
app.use("/company", companyRoute);

export default app;
