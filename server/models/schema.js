//Schemas.js: Contains all mongodb schema instances to use in app


//The app is somewhat an inventory management system. Basically on a site a truck comes in its weight is meaured and the truck is loaded and its weight is measured again. The difference in weight is the weight of the goods. The goods are then stored in the warehouse. The goods are then loaded onto another truck and the weight is measured again. The difference in weight is the weight of the goods that were loaded onto the truck.
// The weight of the goods etc is stored in the database along with the truck identifications it is loaded onto. They are also identified as incoming or outgoing goods.
// So a schema for conteinr/truck along with the weight of the goods and the time of the transaction is needed. other stuff can be added suchas employee handling the goods etc.
// no warehouse rquirement
// Another schema for employee details is needed. This will include the name, email, password, and role of the employee. The role can be either admin, site supervisor, or site employee.


import mongoose from "mongoose";

const UserInfoSchema = new mongoose.Schema({
    firstName: {type:String, required: true},
    lastName: {type:String, required: true},
    email: {type:String, required: true},
    hashedPassword: {type:String, required: true},
    //role --> either admin, supervisor, or employee
    role: {type:String, required: true, enum: ["admin", "supervisor", "employee"]}
});

const GoodsContainerSchema = new mongoose.Schema({
    type: {type:String, required: true}, //incoming or outgoing
    serial_no: {type:String, required: true}, //serial number of the container
    truck_no: {type:String, required: true}, //truck number
    driver_name: {type:String, required: true}, //name of the driver
    driver_contact: {type:String, required: true}, //contact of the driver
    goods_type: {type:String, required: true}, //type of goods
    empty_weight: {type:Number, default: 0}, //weight of the truck
    filled_weight: {type:Number, default: 0}, //weight of the truck after loading/unloading
    goods_weight: {type:Number, default: 0}, //weight of the goods
    date_created: {type:Date, required: true},
    date_updated: {type:Date, required: true},
    //employee handling the goods
    employee: {type:mongoose.Schema.Types.ObjectId, ref: "User", required: true}
});

const NotificationsSchema = new mongoose.Schema({
    user: {type:String, required: true}, //each user will have a list of notifications
    notifications: {type: [{
        notifType: {type:String, required: true}, //type of notification
        data: {type:String, required: true},
        time: {type:Date, required: true}, //time of the notification
    }]}
})


//just to hole the 8-10 type of goods being handled in this app
const goodsTypeSchema = new mongoose.Schema({
    name: {type:String, required: true},
});

export const User = mongoose.model("User", UserInfoSchema);
export const GoodsContainer = mongoose.model("GoodsContainer", GoodsContainerSchema);
export const Notifications = mongoose.model("Notifications", NotificationsSchema);
export const GoodsType = mongoose.model("GoodsType", goodsTypeSchema);