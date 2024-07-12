import { addWeighingTransaction, addExternalTransaction, addContractorWork, deleteContractorWork, deleteExternalTransaction, deleteWeighingTransaction, getContractorWork, getExternalTransactions, getWeighingTransactions, getIndividualContractorWork, getIndividualExternalTransaction, getIndividualWeighingTransaction, updateWeighingTransaction, updateContractorWork, updateExternalTransaction, updateGoodsType ,addGoodsType, getGoodsTypes, addWeightAdjustment, updateWeightAdjustment,widgetData } from "../controllers/goods_controller.js";
import express from "express";

const goods_router = express.Router(); 

goods_router.post('/addWeighingTransaction', addWeighingTransaction);
goods_router.post('/addExternalTransaction', addExternalTransaction);
goods_router.post('/addContractorWork', addContractorWork);
goods_router.delete('/deleteContractorWork', deleteContractorWork);
goods_router.delete('/deleteExternalTransaction', deleteExternalTransaction);
goods_router.delete('/deleteWeighingTransaction', deleteWeighingTransaction);
goods_router.get('/getContractorWork', getContractorWork);
goods_router.get('/getExternalTransactions', getExternalTransactions);
goods_router.get('/getWeighingTransactions', getWeighingTransactions);
goods_router.get('/getIndividualContractorWork', getIndividualContractorWork);
goods_router.get('/getIndividualExternalTransaction', getIndividualExternalTransaction);
goods_router.get('/getIndividualWeighingTransaction', getIndividualWeighingTransaction);
goods_router.post('/updateWeighingTransaction', updateWeighingTransaction);
goods_router.post('/updateContractorWork', updateContractorWork);
goods_router.post('/updateExternalTransaction', updateExternalTransaction);
goods_router.post('/updateGoodsType', updateGoodsType);
goods_router.post('/addGoodsType', addGoodsType);
goods_router.get('/getGoodsTypes', getGoodsTypes);
goods_router.post('/addWeightAdjustment', addWeightAdjustment);
goods_router.post('/updateWeightAdjustment', updateWeightAdjustment);
goods_router.get('/widgetData', widgetData);


export default goods_router;