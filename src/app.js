import express from "express";

const app = express();

app.use(express.json());
app.use(cookieParser());

// import routes
import userRoute from "./routes/user.route.js";
import cookieParser from "cookie-parser";

app.use("/user", userRoute);

export default app;
