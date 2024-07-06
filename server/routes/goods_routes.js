import { addContainer, updateContainer, deleteContainer, getContainers, getIndividualContainer, widgetData, addType, getAllTypes } from "../controllers/goods_controller.js";
import express from "express";

const goods_router = express.Router(); 

goods_router.post('/addContainer', addContainer);
goods_router.get('/getContainers', getContainers);
goods_router.get('/getIndividualContainer', getIndividualContainer);
goods_router.post('/updateContainer', updateContainer);
goods_router.delete('/deleteContainer', deleteContainer);
goods_router.get('/widgetData', widgetData);
goods_router.post('/addType', addType);
goods_router.get('/getAllTypes', getAllTypes);

export default goods_router;