//Server side to handle database operariotn via mongoose
import { app } from "./app.js";
import { config } from "dotenv";
import mongoose from "mongoose";
//mongodb cluster user password: NkeWy827xk6PvwQb

config(
    {
        path: "./config.env"
    }
);

app.get("/", (req,res)=>
{
    res.json({message: "Server is running..."});
});

//MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(()=>
{
    console.log("Connected to MongoDB");

    app.listen(process.env.PORT, ()=>
    {
        console.log(`Server is running on port ${process.env.PORT}`);
    });

})
.catch((error)=>
{
    console.log(error);
})

