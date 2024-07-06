//App.js file to contain all routes to use and export app instance
import express from 'express';
import cors from 'cors';
import user_router from './routes/user_routes.js';
import goods_router from './routes/goods_routes.js';


export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// App routes
app.use('/user', user_router);
app.use('/goods', goods_router);