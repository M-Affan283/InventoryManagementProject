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
    role: {type:String, required: true, enum: ["admin", "employee"]},
    date_created: {type:Date, required: true}, //date of account creation
    created_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who created the account
    date_updated: {type:Date, required: false}, //date of last update,
    updated_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who last updated the account
    is_deleted: {type:Boolean, default: false}, //if the account is deleted (1) or not (0)
    date_deleted: {type:Date, required: false}, //date of deletion
    delete_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who deleted the account
    delete_reason: {type:String, required: false} //reason for deletion
});

const WeighingTransactionsSchema = new mongoose.Schema({
    type: {type: String, required: true}, //incoming or outgoing
    truck_no: {type:String, required: true}, //truck number
    driver_name: {type:String, required: true}, //name of the driver
    driver_contact: {type:String, required: true}, //contact of the driver
    vendor: {type:mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true}, //vendor code
    goods_type_id: {type:mongoose.Schema.Types.ObjectId, ref: "GoodsType", required: true}, //type of goods
    empty_weight: {type:Number, default: 0}, //weight of the truck
    filled_weight: {type:Number, default: 0}, //weight of the truck after loading/unloading
    goods_weight: {type:Number, default: 0}, //weight of the goods
    weight_adjust: {type:Number, default: 0}, //adjustment in weight
    date_filled_weight: {type:Date, required: false}, //date of filled truck weight
    date_empty_weight: {type:Date, required: true}, //date of empty truck weight. essentially the date of creation
    is_deleted: {type:Boolean, default: false}, //if the transaction is deleted (1) or not (0)
    date_deleted: {type:Date, required: false}, //date of deletion
    delete_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who deleted the transaction
    delete_reason: {type:String, required: false}, //reason for deletion
    employee: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: true} //employee handling the goods
});


// need to create a seperate schema for outgoing weight transactions
// because it will have multiple weights to be measured
// so there is a truck, which has a container, which has goods
// the truck can be different.
// we need container weight and good weight
// first we measure truck weight, then container weight, then goods weight
// total weight = truck weight + container weight + goods weight
// container weight = (truck weight + container weight) - truck weight
// goods weight = (truck weight + container weight + goods weight) - (truck weight + container weight)

const OutgoingWeighingTransactionsSchema = new mongoose.Schema({
    type: {type: String, required: true}, //outgoing
    truck_no: {type:String, required: true}, //truck number
    driver_name: {type:String, required: true}, //name of the driver
    driver_contact: {type:String, required: true}, //contact of the driver
    vendor: {type:mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true}, //vendor code
    goods_type_id: {type:mongoose.Schema.Types.ObjectId, ref: "GoodsType", required: true}, //type of goods
    truck_weight: {type:Number, default: 0}, //weight of the truck
    container_weight: {type:Number, default: 0}, //weight of the container
    goods_weight: {type:Number, default: 0}, //weight of the goods
    date_empty_weight: {type:Date, required: true}, //date of empty container and truck weight. essentially the date of creation
    date_filled_weight  : {type:Date, required: false}, //date of filled container and truck weight
    is_deleted: {type:Boolean, default: false}, //if the transaction is deleted (1) or not (0)
    date_deleted: {type:Date, required: false}, //date of deletion
    delete_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who deleted the transaction
    delete_reason: {type:String, required: false}, //reason for deletion
    employee: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: true} //employee handling the goods
})

//vendor schema for weight transactions
const VendorSchema = new mongoose.Schema({
    // vendor_code: {type:String, required: true}, //vendor code
    vendor_name: {type:String, required: true}, //vendor name
    vendor_contact: {type:String, required: true}, //vendor contact
    vendor_poc: {type:String, required: true}, //vendor point of contact
    date_created: {type:Date, required: true}, //date of account creation
    created_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who created the account
    date_updated: {type:Date, required: false}, //date of last update,
    updated_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who last updated the account
    is_deleted: {type:Boolean, default: false}, //if the account is deleted (1) or not (0)
    date_deleted: {type:Date, required: false}, //date of deletion
    delete_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who deleted the account
    delete_reason: {type:String, required: false} //reason for deletion
});

//internal labour handling the goods
const ContractorSchema = new mongoose.Schema({
    contractor_code: {type:String, required: true}, //contractor code
    contractor_name: {type:String, required: true}, //contractor name
    contractor_contact: {type:String, required: true}, //contractor contact
    date_created: {type:Date, required: true}, //date of account creation
    created_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who created the account
    date_updated: {type:Date, required: false}, //date of last update,
    updated_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who last updated the account
    is_deleted: {type:Boolean, default: false}, //if the account is deleted (1) or not (0)
    date_deleted: {type:Date, required: false}, //date of deletion
    delete_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who deleted the account
    delete_reason: {type:String, required: false} //reason for deletion

});

const ContractorWorkSchema = new mongoose.Schema({
    contractor_id: {type:mongoose.Schema.Types.ObjectId, ref: "Contractor", required: true}, //contractor id
    goods_type_id: {type:mongoose.Schema.Types.ObjectId, ref: "GoodsType", required: true}, //type of goods
    goods_weight: {type:Number, default: 0}, //weight of the goods
    garbage_weight: {type:Number, default: 0}, //weight of the garbage
    goods_rate: {type:Number, default: 0}, //rate of the goods
    work_amount: {type:Number, default: 0}, //amount of work done rate*weight
    date_created: {type:Date, required: true}, //date of account creation
    created_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who created the account
    date_updated: {type:Date, required: false}, //date of last update,
    updated_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who last updated the account
    is_deleted: {type:Boolean, default: false}, //if the account is deleted (1) or not (0)
    date_deleted: {type:Date, required: false}, //date of deletion
    delete_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who deleted the account
    delete_reason: {type:String, required: false} //reason for deletion
});

const GoodsTypeSchema = new mongoose.Schema({
    good_code: {type:String, required: true}, //goods code
    good_name: {type:String, required: true}, //goods name
    good_weight: {type:Number, default: 0}, //weight of the goods inventory available
    good_rate: {type:Number, default: 0}, //rate of the goods
    date_created: {type:Date, required: true}, //date of account creation
    created_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who created the account
    date_updated: {type:Date, required: false}, //date of last update,
    updated_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who last updated the account
    is_deleted: {type:Boolean, default: false}, //if the account is deleted (1) or not (0)
    date_deleted: {type:Date, required: false}, //date of deletion
    delete_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who deleted the account
    delete_reason: {type:String, required: false} //reason for deletion
});

const ExternalTransactionsSchema = new mongoose.Schema({
    company_name: {type:String, required: true}, //company name
    truck_no: {type:String, required: true}, //truck number
    driver_name: {type:String, required: true}, //name of the driver
    driver_contact: {type:String, required: true}, //contact of the driver
    vehicle_weight: {type:Number, default: 0}, //weight of the vehicle
    external_rate: {type:Number, default: 0}, //rate of the goods
    external_amount: {type:Number, default: 0}, //amount of the goods rate*weight
    date_created: {type:Date, required: true}, //date of account creation
    date_updated: {type:Date, required: false}, //date of last update,
    updated_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who last updated the account
    created_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who created the account
    is_deleted: {type:Boolean, default: false}, //if the account is deleted (1) or not (0)
    date_deleted: {type:Date, required: false}, //date of deletion
    delete_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who deleted the account
    delete_reason: {type:String, required: false} //reason for deletion
})

// const ExternalRateSchema = new mongoose.Schema({
//     extrate_amount: {type:Number, default: 0}, //rate of the goods
//     date_created: {type:Date, required: true}, //date of account creation
//     created_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who created the account
//     date_updated: {type:Date, required: false}, //date of last update,
//     updated_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who last updated the account
//     is_deleted: {type:Boolean, default: false}, //if the account is deleted (1) or not (0)
//     date_deleted: {type:Date, required: false}, //date of deletion
//     delete_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who deleted the account
//     delete_reason: {type:String, required: false} //reason for deletion
// });

const NotificationsSchema = new mongoose.Schema({
    user: {type:String, required: true}, //each user will have a list of notifications
    notifications: {type: [{
        notifType: {type:String, required: true}, //type of notification
        data: {type:String, required: true},
        time: {type:Date, required: true}, //time of the notification
    }]}
})


export const User = mongoose.model("UserInfo", UserInfoSchema);
export const WeighingTransactions = mongoose.model("WeighingTransactions", WeighingTransactionsSchema);
export const OutgoingWeighingTransactions = mongoose.model("OutgoingWeighingTransactions", OutgoingWeighingTransactionsSchema);
export const Vendor = mongoose.model("Vendor", VendorSchema);
export const Contractor = mongoose.model("Contractor", ContractorSchema);
export const ContractorWork = mongoose.model("ContractorWork", ContractorWorkSchema);
export const GoodsType = mongoose.model("GoodsType", GoodsTypeSchema);
export const ExternalTransactions = mongoose.model("ExternalTransactions", ExternalTransactionsSchema);
// export const ExternalRate = mongoose.model("ExternalRate", ExternalRateSchema);
export const Notifications = mongoose.model("Notifications", NotificationsSchema);