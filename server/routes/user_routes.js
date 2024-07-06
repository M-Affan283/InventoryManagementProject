//all user routes from user_controller.js go here
import { login, createUser, deleteUser, updatePassword, resetPassword, getAllUsers, getUserNotifications } from "../controllers/user_controller.js";
import express from 'express';

const user_router = express.Router();

user_router.post('/login', login);
user_router.post('/createUser', createUser);
user_router.delete('/deleteUser', deleteUser);
user_router.post('/updatePassword', updatePassword);
user_router.post('/resetPassword', resetPassword);
user_router.get('/getAllUsers', getAllUsers);
user_router.get('/getNotifications', getUserNotifications);

export default user_router;