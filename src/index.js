import "dotenv/config";
import connectDB from "./DB/DB.js";
import { server } from "./utils/socket.js";

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    console.log("Connected to DB");
    server.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("connectDB failed : ", error);
  });
