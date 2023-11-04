const mongoose = require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/VOLTTRON')
const express = require("express");
const app = express();
const PORT = 3000;



//FOR USER ROUTE
const userRoute = require("./routes/userRoute");
app.use('/',userRoute);




app.listen(PORT,()=>{

    console.log(`server is running on port ${PORT}`);
})