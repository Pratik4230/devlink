import app from "./app.js";
import 'dotenv/config';
import connectDB from "./DB/DB.js";


const PORT = process.env.PORT;

connectDB()
.then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
        
    }  )
} 
)
.catch((error) => {
    console.log("connectDB failed : ", error);
    
})

