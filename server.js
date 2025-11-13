import express from 'express';
import dotenv from 'dotenv';
import { conn } from './config/db.js';
import userRoute from './routes/userRoute.js';
import taskRoutes from './routes/taskRoutes.js';
import productRoutes from './routes/productRoute.js'
import orderRoutes from './routes/orderRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import sellerRoutes from './routes/sellerRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import logger from './middlewares/logger.js';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';
import cors from "cors"

// config dot env
dotenv.config();
//initilize express


const app = express();
// estaiblish db connection
conn();
const redisUrl = process.env.REDIS_URL
if(!redisUrl){
    console.log("Missing redis ur;")
    process.exit(1)
    
}

export const redisClient = createClient({
    url:redisUrl
})
redisClient.connect().then(()=>{
    console.log('connected to redis ')
    
}).catch((error)=>{
    console.error('errorcartRoutes' ,error);
    
})
app.use(cors())
// express json middleware
app.use(express.json());


// route logger middleware
app.use(logger);
app.use(cookieParser());

// use route
app.use('/api/users', userRoute);
app.use('/api/products', productRoutes);
app.use('/api/order' , orderRoutes  )
app.use('/api/cart' , cartRoutes  )
app.use('/api/dashboard/seller' , sellerRoutes  )
app.use('/api/dashboard/admin' , adminRoutes  )

// app.use('/api/tasks', taskRoutes);
// start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(` Server running on port ${port}`));
