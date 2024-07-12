//Contains all functions related to handling goods such as weighing them and storing them etc in the database
import { User, WeighingTransactions, Notifications, Contractor, ContractorWork, GoodsType,ExternalTransactions, ExternalRate } from "../models/schema.js";

//add update funcition for all transactions, contractor work and external transactions
//add weight adjustment update to all relevant functions and also special function to update weight adjustment


//ADD IN/OUT RECORD PART
export const addWeighingTransaction = async (req,res) =>
{
    const {type, truck_no, driver_name, driver_contact, good_code, empty_weight, filled_weight, goods_weight, employee} = req.body;
    console.log("Add weighing transaction request for time: ", Date.now());
    console.log(`details: ${type}, ${truck_no}, ${driver_name}, ${driver_contact}, ${good_code}, ${empty_weight}, ${filled_weight}, ${goods_weight}, ${employee}`)

    try
    {
        const user_present = await User.findOne({email: employee});
        if(!user_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        const goods_type = await GoodsType.findOne({good_code: good_code});
        if(!goods_type)
        {
            return res.status(400).json({message: "Goods type not found"});
        }

        //parse all float values to float
        const empty_weight_float = parseFloat(empty_weight).toFixed(2);
        const filled_weight_float = parseFloat(filled_weight).toFixed(2);
        const goods_weight_float = parseFloat(goods_weight).toFixed(2);
        // const weight_adjust_float = parseFloat(weight_adjust).toFixed(2);

        //if truck has been filled
        if(goods_weight > 0)
        {

            console.log("Truck has been filled");

            //add filled weight, empty weight, goods weight, weight adjust, date empty weight, employee to the weighing transaction
            await WeighingTransactions.create({
                type: type,
                truck_no: truck_no,
                driver_name: driver_name,
                driver_contact: driver_contact,
                goods_type_id: goods_type._id,
                empty_weight: empty_weight_float,
                filled_weight: filled_weight_float,
                goods_weight: goods_weight_float,
                date_empty_weight: new Date(),
                date_filled_weight: new Date(),
                employee: user_present._id
            })
        }
        else
        {

            console.log("Truck has not been filled");

            //goods weight is 0 which means truck filles weight will be added later
            await WeighingTransactions.create({
                type: type,
                truck_no: truck_no,
                driver_name: driver_name,
                driver_contact: driver_contact,
                goods_type_id: goods_type._id,
                empty_weight: empty_weight,
                filled_weight: filled_weight,
                goods_weight: goods_weight,
                date_empty_weight: new Date(),
                is_deleted: false,
                employee: user_present._id
            });

        }

        return res.status(200).json({message: "Weighing transaction added successfully"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const updateWeighingTransaction = async (req,res) =>
{
    const {transaction_id, empty_weight, filled_weight, goods_weight} = req.body;
    console.log("Update weighing transaction request");

    try
    {
        const transaction = await WeighingTransactions.findOne({_id: transaction_id});
        if(!transaction)
        {
            return res.status(400).json({message: "Transaction not found"});
        }

        //parse all float values to float
        const empty_weight_float = parseFloat(empty_weight).toFixed(2);
        const filled_weight_float = parseFloat(filled_weight).toFixed(2);
        const goods_weight_float = parseFloat(goods_weight).toFixed(2);

        //update the transaction
        transaction.empty_weight = empty_weight_float;
        transaction.filled_weight = filled_weight_float;
        transaction.goods_weight = goods_weight_float;
        transaction.date_filled_weight = new Date();
        await transaction.save();

        //maybe add notification for the employee that container has been updated after update later

        return res.status(200).json({message: "Transaction updated successfully"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const deleteWeighingTransaction = async (req,res) =>
{
    const {transaction_id, delete_reason, employee} = req.body;
    console.log("Delete weighing transaction request for time: ", Date.now());

    try
    {

        const employee_present = await User.findOne({email: employee});

        if(!employee_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        //find the transaction
        const transaction = await WeighingTransactions.findOne({_id: transaction_id}).populate("employee");

        if(!transaction)
        {
            return res.status(400).json({message: "Transaction not found"});
        }

        if(transaction.is_deleted)
        {
            return res.status(400).json({message: "Transaction already deleted"});
        }

        //get employee notificaiton
        const employee_notifications = await Notifications.findOne({user_id: transaction.employee.email});
        const admin = await User.findOne({role: "admin"});
    
        const admin_notifications = await Notifications.findOne({user: admin.email});

        //add notification for the employee that container has been deleted after deletion
        let notif_data = {notifType:"transaction_deleted", data: `Truck with transactions id ${transaction_id} has been marked as deleted`, time: new Date()};
        // console.log(employee_notifications)
        employee_notifications.notifications.push(notif_data);
        admin_notifications.notifications.push(notif_data);

        //update the transaction
        transaction.is_deleted = true;
        transaction.date_deleted = new Date();
        transaction.delete_by = employee_present._id;
        transaction.delete_reason = delete_reason;
        await transaction.save();
        await employee_notifications.save();
        await admin_notifications.save();

        return res.status(200).json({message: "Transaction deleted successfully"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

//LIST ALL TRANSACTIONS
export const getWeighingTransactions = async (req,res) =>
{
    const {email, searchQuery="", page=1, limit=10} = req.query;
    console.log("Get containers request for:" , email);

    try
    {
        console.log("Query: ", req.query);

        const user = await User.findOne({email: email});
        
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        
        const skip = (pageNumber - 1) * limitNumber;

        if(user.role === "admin")
        {
            //get all transactions
            //first check if search query contains an emplouyee name only
            console.log("Get containers admin request");
            let searchFilter = {};

            if (searchQuery) {
                const userSearchFilter = {
                    $or: [
                        { firstName: { $regex: searchQuery, $options: 'i' } },
                        { lastName: { $regex: searchQuery, $options: 'i' } }
                    ]
                };

                const users = await User.find(userSearchFilter);
                const userIds = users.map(user => user._id);

                searchFilter = {
                    $or: [
                        { type: { $regex: searchQuery, $options: 'i' } },
                        { truck_no: { $regex: searchQuery, $options: 'i' } },
                        { driver_name: { $regex: searchQuery, $options: 'i' } },
                        { driver_contact: { $regex: searchQuery, $options: 'i' } },
                        { employee: { $in: userIds } },
                        ...(isNaN(parseFloat(searchQuery)) ? [] : [
                            { goods_weight: parseFloat(searchQuery) },
                            { weight_adjust: parseFloat(searchQuery) }
                        ])
                    ]
                };
            }

            const transactions = await WeighingTransactions.find(searchFilter).skip(skip).limit(limitNumber).populate("goods_type_id").populate("employee")

            return res.status(200).json({transactions: transactions});
        }
        else
        {
            console.log("Get containers employee request");
            //no need for the userid garbage just get only employee transactions
            let searchFilter = searchQuery ? {
                $or: [
                    { type: { $regex: searchQuery, $options: 'i' } },
                    { truck_no: { $regex: searchQuery, $options: 'i' } },
                    { driver_name: { $regex: searchQuery, $options: 'i' } },
                    { driver_contact: { $regex: searchQuery, $options: 'i' } },
                    ...(isNaN(parseFloat(searchQuery)) ? [] : [
                        { goods_weight: parseFloat(searchQuery) },
                        { weight_adjust: parseFloat(searchQuery) }
                    ])
                ],
                employee: user._id

            } : { employee: user._id };

            const transactions = await WeighingTransactions.find(searchFilter).skip(skip).limit(limitNumber).populate("goods_type_id")
            return res.status(200).json({transactions: transactions});
        }
    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getIndividualWeighingTransaction = async (req,res) =>
{
    const {transaction_id} = req.query;
    console.log("Get individual weighing transaction request: ", transaction_id);

    try
    {
        const transaction = await WeighingTransactions.findOne({_id: transaction_id}).populate("goods_type_id").populate("employee");
        if(!transaction)
        {
            return res.status(400).json({message: "Transaction not found"});
        }

        return res.status(200).json({transaction: transaction});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const addWeightAdjustment = async (req,res) =>
{
    const {transaction_id, weight_adjust, employee} = req.body;
    console.log("Add weight adjustment request");

    try
    {
        const user_present = await User.findOne({email: employee});
        if(!user_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        const transaction = await WeighingTransactions.findOne({_id: transaction_id});
        if(!transaction)
        {
            return res.status(400).json({message: "Transaction not found"});
        }

        //parse all float values to float
        const weight_adjust_float = parseFloat(weight_adjust).toFixed(2);

        //update the transaction
        transaction.weight_adjust = weight_adjust_float;
        await transaction.save();

        return res.status(200).json({message: "Weight adjustment added successfully"});

    }
    catch(error)
    {
        return res.status(500).json({message: "Internal server error"});
    }
}

export const updateWeightAdjustment = async (req,res) =>
{
    const {transaction_id, weight_adjust, employee} = req.body;
    console.log("Update weight adjustment request");

    try
    {
        const user_present = await User.findOne({email: employee});

        if(!user_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        const transaction = await WeighingTransactions.findOne({_id: transaction_id});
        if(!transaction)
        {
            return res.status(400).json({message: "Transaction not found"});
        }

        //parse all float values to float
        const weight_adjust_float = parseFloat(weight_adjust).toFixed(2);

        //update the transaction
        transaction.weight_adjust = weight_adjust_float;
        await transaction.save();

        return res.status(200).json({message: "Weight adjustment updated successfully"});
    }
    catch(error)
    {
        return res.status(500).json({message: "Internal server error"});
    }
}


export const addContractorWork = async (req,res) =>
{
    const {contractor_code, goods_code, goods_weight, employee} = req.body;
    console.log("Add contractor work request");

    try
    {

        const employee_present = await User.findOne({email: employee});

        if(!employee_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        //get contractor
        const contractor = await Contractor.findOne({contractor_code: contractor_code});
        if(!contractor)
        {
            return res.status(400).json({message: "Contractor not found"});
        }

        const goods_type_present = await GoodsType.findOne({good_code: goods_code});
        if(!goods_type_present)
        {
            return res.status(400).json({message: "Goods type not found"});
        }

        //parse all float values to float
        const goods_weight_float = parseFloat(goods_weight).toFixed(2);

        await ContractorWork.create({
            contractor_id: contractor._id,
            goods_type_id: goods_type_present._id,
            goods_weight: goods_weight_float,
            goods_rate: goods_type_present.good_rate,
            work_amount: goods_weight_float * goods_type_present.good_rate,
            date_created: new Date(),
            created_by: employee_present._id,
            // date_updated: new Date(),
            // updated_by: employee_present._id
        });

        return res.status(200).json({message: "Contractor work added successfully"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const updateContractorWork = async (req,res) =>
{
    const {work_id, goods_weight, employee} = req.body;
    console.log("Update contractor work request");

    try
    {
        const work = await ContractorWork.findOne({_id: work_id});
        if(!work)
        {
            return res.status(400).json({message: "Work not found"});
        }
        
        const employee_present = await User.findOne({email: employee});

        //parse all float values to float
        const goods_weight_float = parseFloat(goods_weight).toFixed(2);

        work.goods_weight = goods_weight_float;
        work.work_amount = goods_weight_float * work.goods_rate;
        work.date_updated = new Date();
        work.updated_by = employee_present._id;
        await work.save();

        //notification later

        return res.status(200).json({message: "Work updated successfully"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const deleteContractorWork = async (req,res) =>
{
    const {work_id, delete_reason, employee} = req.body;
    console.log("Delete contractor work request");

    try
    {
        const work = await ContractorWork.findOne({_id: work_id});
        if(!work)
        {
            return res.status(400).json({message: "Work not found"});
        }

        if(work.is_deleted)
        {
            return res.status(400).json({message: "Work already deleted"});
        }

        const employee_present = await User.findOne({email: employee});
        if(!employee_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        work.is_deleted = true;
        work.date_deleted = new Date();
        work.delete_by = employee_present._id;
        work.delete_reason = delete_reason;
        await work.save();

        return res.status(200).json({message: "Work deleted successfully"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getContractorWork = async (req,res) =>
{
    const {email, searchQuery="", page=1, limit=10} = req.query;
    console.log("Get contractor work request for:" , email);

    try
    {
        console.log("Query: ", req.query);

        const user = await User.findOne({email: email});

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        
        const skip = (pageNumber - 1) * limitNumber;

        // console.log(user._id)

        if(user.role === "admin")
        {
            //get all transactions
            //first check if search query contains an emplouyee name only
            console.log("Get contractor work admin request");
            let searchFilter = {};

            if (searchQuery) {
                const userSearchFilter = {
                    $or: [
                        { firstName: { $regex: searchQuery, $options: 'i' } },
                        { lastName: { $regex: searchQuery, $options: 'i' } }
                    ]
                };

                const users = await User.find(userSearchFilter);
                const userIds = users.map(user => user._id);

                const contractorSearchFilter = {
                    $or: [
                        { contractor_name: { $regex: searchQuery, $options: 'i' } },
                        { contractor_code: { $regex: searchQuery, $options: 'i' } }
                    ]
                };

                const contractors = await Contractor.find(contractorSearchFilter);
                const contractorIds = contractors.map(contractor => contractor._id);

                searchFilter = {
                    $or: [
                        { contractor_id: { $in: contractorIds } },
                        { created_by: { $in: userIds } },
                        ...(isNaN(parseFloat(searchQuery)) ? [] : [
                            { goods_weight: parseFloat(searchQuery) },
                            { goods_rate: parseFloat(searchQuery) },
                            { work_amount: parseFloat(searchQuery) }
                        ])
                    ]
                };
                
            }

            const transactions = await ContractorWork.find(searchFilter).skip(skip).limit(limitNumber).populate("goods_type_id").populate("contractor_id")

            return res.status(200).json({transactions: transactions});
        }
        else
        {
            //can search by contractor credentials
            console.log("Get contractor work employee request");
            let searchFilter = {created_by: user._id};

            if(searchQuery)
            {
                const contractorSearchFilter = {
                    $or: [
                        { contractor_name: { $regex: searchQuery, $options: 'i' } },
                        { contractor_code: { $regex: searchQuery, $options: 'i' } }
                    ]
                };

                const contractors = await Contractor.find(contractorSearchFilter);
                const contractorIds = contractors.map(contractor => contractor._id);

                searchFilter = {
                    $or: [
                        { contractor_id: { $in: contractorIds } },
                        ...(isNaN(parseFloat(searchQuery)) ? [] : [
                            { goods_weight: parseFloat(searchQuery) },
                            { goods_rate: parseFloat(searchQuery) },
                            { work_amount: parseFloat(searchQuery) }
                        ])
                    ],
                    created_by: user._id
                };
            
            }
            
            const transactions = await ContractorWork.find(searchFilter).skip(skip).limit(limitNumber).populate("goods_type_id").populate("contractor_id")
            // console.log(transactions)
            return res.status(200).json({transactions: transactions});
        }
    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getIndividualContractorWork = async (req,res) =>
{
    const {work_id} = req.query;
    console.log("Get individual contractor work request: ", work_id);

    try
    {
        const work = await ContractorWork.findOne({_id: work_id}).populate("goods_type_id").populate("contractor_id");
        if(!work)
        {
            return res.status(400).json({message: "Work not found"});
        }

        return res.status(200).json({transaction: work});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}


export const addExternalTransaction = async (req,res) =>
{
    const {company_name, truck_no, driver_name, driver_contact, vehicle_weight, external_rate, employee} = req.body;
    console.log("Add external transaction request");

    try
    {
        const user_present = await User.findOne({email: employee});

        //parse all float values to float
        const vehicle_weight_float = parseFloat(vehicle_weight).toFixed(2);
        const external_rate_float = parseFloat(external_rate).toFixed(2);

        await ExternalTransactions.create({
            company_name: company_name,
            truck_no: truck_no, //unique truck number for identification
            driver_name: driver_name,
            driver_contact: driver_contact,
            vehicle_weight: vehicle_weight_float,
            external_rate: external_rate_float,
            external_amount: (vehicle_weight_float * external_rate_float).toFixed(2),
            date_created: new Date(),
            created_by: user_present._id,
        });

        return res.status(200).json({message: "External transaction added successfully"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const updateExternalTransaction = async (req,res) =>
{
    const {transaction_id, truck_no, company_name, driver_name, driver_contact, vehicle_weight, external_rate, employee} = req.body;
    console.log("Update external transaction request");

    try
    {
        const transaction = await ExternalTransactions.findOne({_id: transaction_id});

        if(!transaction)
        {
            return res.status(400).json({message: "Transaction not found"});
        }

        const user_present = await User.findOne({email: employee});

        //parse all float values to float
        const vehicle_weight_float = parseFloat(vehicle_weight).toFixed(2);
        const external_rate_float = parseFloat(external_rate).toFixed(2);
        
        transaction.company_name = company_name;
        transaction.truck_no = truck_no;
        transaction.driver_name = driver_name;
        transaction.driver_contact = driver_contact;
        transaction.vehicle_weight = vehicle_weight_float;
        transaction.external_rate = external_rate_float;
        transaction.external_amount = (vehicle_weight_float * external_rate_float).toFixed(2);
        transaction.date_updated = new Date();
        transaction.updated_by = user_present._id;
        await transaction.save();

        return res.status(200).json({message: "Transaction updated successfully"});

    }
    catch(error)
    {
        return res.status(500).json({message: "Internal server error"});
    }
}

export const deleteExternalTransaction = async (req,res) =>
{
    const {transaction_id, delete_reason, employee} = req.body;
    console.log("Delete external transaction request");

    try
    {
        const transaction = await ExternalTransactions.findOne({_id: transaction_id});
        if(!transaction)
        {
            return res.status(400).json({message: "Transaction not found"});
        }

        if(transaction.is_deleted)
        {
            return res.status(400).json({message: "Transaction already deleted"});
        }

        const employee_present = await User.findOne({email: employee});
        if(!employee_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        transaction.is_deleted = true;
        transaction.date_deleted = new Date();
        transaction.delete_by = employee_present._id;
        transaction.delete_reason = delete_reason;
        await transaction.save();

        return res.status(200).json({message: "Transaction deleted successfully"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

//get external transactions. for admin get all, for employee get only their transactions and non deleted transactions
export const getExternalTransactions = async (req,res) =>
{
    const {email, searchQuery="", page=1, limit=10} = req.query;
    console.log("Get external transactions request for:" , email);

    try
    {
        console.log("Query: ", req.query);

        const user = await User.findOne({email: email});

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        
        const skip = (pageNumber - 1) * limitNumber;
        
        if(user.role === "admin")
        {

            console.log("Get external transactions admin request");
            //simple searching

            let searchFilter = searchQuery ? {
                $or: [
                    { company_name: { $regex: searchQuery, $options: 'i' } },
                    { truck_no: { $regex: searchQuery, $options: 'i' } },
                    { driver_name: { $regex: searchQuery, $options: 'i' } },
                    { driver_contact: { $regex: searchQuery, $options: 'i' } },
                    ...(isNaN(parseFloat(searchQuery)) ? [] : [
                        { vehicle_weight: parseFloat(searchQuery) },
                        { external_rate: parseFloat(searchQuery) },
                        { external_amount: parseFloat(searchQuery) }
                    ])
                ]
            }
            : {};

            const transactions = await ExternalTransactions.find(searchFilter).skip(skip).limit(limitNumber).populate("created_by");
            return res.status(200).json({transactions: transactions});
        }
        else
        {
            console.log("Get external transactions employee request");

            let searchFilter = searchQuery ? {
                $or: [
                    { company_name: { $regex: searchQuery, $options: 'i' } },
                    { truck_no: { $regex: searchQuery, $options: 'i' } },
                    { driver_name: { $regex: searchQuery, $options: 'i' } },
                    { driver_contact: { $regex: searchQuery, $options: 'i' } },
                    ...(isNaN(parseFloat(searchQuery)) ? [] : [
                        { vehicle_weight: parseFloat(searchQuery) },
                        { external_rate: parseFloat(searchQuery) },
                        { external_amount: parseFloat(searchQuery) }
                    ])
                ],
                created_by: user._id
            }
            : { created_by: user._id };

            const transactions = await ExternalTransactions.find(searchFilter).skip(skip).limit(limitNumber).populate("created_by");
            return res.status(200).json({transactions: transactions});

        }
        
    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getIndividualExternalTransaction = async (req,res) =>
{
    const {transaction_id} = req.query;
    console.log("Get individual external transaction request: ", transaction_id);

    try
    {
        const transaction = await ExternalTransactions.findOne({_id: transaction_id});
        if(!transaction)
        {
            return res.status(400).json({message: "Transaction not found"});
        }

        return res.status(200).json({transaction: transaction});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const addGoodsType = async (req,res) =>
{
    const {good_code, good_name, good_weight, good_rate, employee} = req.body;
    console.log("Add goods type request");

    try
    {
        const user_present = await User.findOne({email: employee});

        const good_weight_float = parseFloat(good_weight).toFixed(2);
        const good_rate_float = parseFloat(good_rate).toFixed(2);

        await GoodsType.create({
            good_code: good_code,
            good_name: good_name,
            good_weight: good_weight_float,
            good_rate: good_rate_float,
            date_created: new Date(),
            created_by: user_present._id,
            // date_updated: new Date(),
            // updated_by: user_present._id
        });

        return res.status(200).json({message: "Goods type added successfully"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const updateGoodsType = async (req,res) =>
{
    const {good_code, good_name, good_weight, good_rate, employee} = req.body;
    console.log("Update goods type request");

    try
    {
        const user_present = await User.findOne({email: employee});
        if(!user_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        const goods_type = await GoodsType.findOne({good_code: good_code});

        if(!goods_type)
        {
            return res.status(400).json({message: "Goods type not found"});
        }

        const good_weight_float = parseFloat(good_weight).toFixed(2);
        const good_rate_float = parseFloat(good_rate).toFixed(2);

        if(goods_type.is_deleted)
        {
            return res.status(400).json({message: "Goods type already deleted"});
        }

        if(goods_type.good_rate !== good_rate_float)
        {
            //get all transactions with that goods type and update the rate and amount
            const transactions = await ContractorWork.find({goods_type_id: goods_type._id});
            transactions.forEach(async transaction => {
                transaction.goods_rate = good_rate_float;
                transaction.work_amount = transaction.goods_weight * good_rate_float;
                await transaction.save();
            }); 
        }
        
        goods_type.good_name = good_name;
        goods_type.good_weight = good_weight_float;
        goods_type.good_rate = good_rate_float;
        goods_type.date_updated = new Date();
        goods_type.updated_by = user_present._id;
        await goods_type.save();

        return res.status(200).json({message: "Goods type updated successfully"});
    }
    catch(error)
    {
        return res.status(500).json({message: "Internal server error"});
    }

}

export const deleteGoodsType = async (req,res) =>
{
    const {good_code, delete_reason, employee} = req.body;
    console.log("Delete goods type request");

    try
    {
        const user_present = await User.findOne({email: employee});
        if(!user_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        const goods_type = await GoodsType.findOne({good_code: good_code});

        if(!goods_type)
        {
            return res.status(400).json({message: "Goods type not found"});
        }

        if(goods_type.is_deleted)
        {
            return res.status(400).json({message: "Goods type already deleted"});
        }

        goods_type.is_deleted = true;
        goods_type.date_deleted = new Date();
        goods_type.delete_by = user_present._id;
        goods_type.delete_reason = delete_reason;
        await goods_type.save();

        return res.status(200).json({message: "Goods type deleted successfully"});
    }
    catch(error)
    {
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getGoodsTypes = async (req,res) =>
{
    console.log("Get goods types request");

    try
    {
        const goods_types = await GoodsType.find({});

        return res.status(200).json({goods: goods_types});
    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}


//simialr to widgetdata prevoiusly do the same thng but for all transactions
// weight transactions: today, weekly, monthly
// contractor work (internal transactions): today, weekly, monthly
// external transactions: today, weekly, monthly
//now widget data is only for admin

export const widgetData = async (req,res) =>
{
    const {email} = req.query;
    console.log("Widget data request for: ", email);

    try
    {
        const user_present = await User.findOne({email:email});

        if(!user_present)
        {
            return res.status(400).json({message: "User not found"});
        }

        if(user_present.role !== "admin")
        {
            return res.status(400).json({message: "User not authorized"});
        }

        //get all non deleted transactions
        const weight_transactions = await WeighingTransactions.find({is_deleted: false}).populate("goods_type_id").populate("employee");
        const internal_transactions = await ContractorWork.find({is_deleted: false}).populate("goods_type_id").populate("contractor_id").populate("created_by");
        const external_transactions = await ExternalTransactions.find({is_deleted: false}).populate("created_by");
        

        // console.log("Weight transactions: ", weight_transactions);

        //get all good types since we will seperate according to good type
        const goods_types = await GoodsType.find({});

        let return_data = calculateWidgetData(weight_transactions, internal_transactions, external_transactions, goods_types);

        return res.status(200).json({data: return_data});


    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}


const calculateWidgetData = (weight_transactions, internal_transactions, external_transactions, goods_types) =>
{

    //weight_trnsactions
    const weight_transaction_widget_data = calculateWeightTransactionWidgetData(weight_transactions, goods_types);

    //internal_transactions
    const internal_transaction_widget_data = calculateInternalTransactionWidgetData(internal_transactions, goods_types);

    //external_transactions
    const external_transaction_widget_data = calculateExternalTransactionWidgetData(external_transactions);


    return {weight_transaction_widget_data, internal_transaction_widget_data, external_transaction_widget_data};

    
}
const calculateExternalTransactionWidgetData = (transactions) =>
{
    //no goods_type so we will sort by company name {value:weight, label: company_name}
    const today = new Date();
    const today_start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const today_end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const today_transactions = transactions.filter(transaction => transaction.date_created >= today_start && transaction.date_created <= today_end);

    let today_vehicle_weight = [];
    let today_external_amount = [];

    let temp_vehicle_weight = {};
    let temp_external_amount = {};

    transactions.forEach(transaction => {
        temp_vehicle_weight[transaction.company_name] = 0;
        temp_external_amount[transaction.company_name] = 0;
    });

    today_transactions.forEach(transaction => {
        temp_vehicle_weight[transaction.company_name] += transaction.vehicle_weight;
        temp_external_amount[transaction.company_name] += transaction.external_amount;
    });

    Object.keys(temp_vehicle_weight).forEach(company_name => {
        if (temp_vehicle_weight[company_name] > 0) {
            today_vehicle_weight.push({ value: temp_vehicle_weight[company_name], label: company_name });
        }
        if (temp_external_amount[company_name] > 0) {
            today_external_amount.push({ value: temp_external_amount[company_name], label: company_name });
        }
    });

    //this week
    const this_week = new Date();
    const this_week_start = new Date(this_week.getFullYear(), this_week.getMonth(), this_week.getDate() - this_week.getDay(), 0, 0, 0);
    const this_week_end = new Date(this_week.getFullYear(), this_week.getMonth(), this_week.getDate() + (6 - this_week.getDay()), 23, 59, 59);

    const this_week_transactions = transactions.filter(transaction => transaction.date_created >= this_week_start && transaction.date_created <= this_week_end);

    let this_week_vehicle_weight = [];
    let this_week_external_amount = [];

    temp_vehicle_weight = {};
    temp_external_amount = {};

    transactions.forEach(transaction => {
        temp_vehicle_weight[transaction.company_name] = 0;
        temp_external_amount[transaction.company_name] = 0;
    });

    this_week_transactions.forEach(transaction => {
        temp_vehicle_weight[transaction.company_name] += transaction.vehicle_weight;
        temp_external_amount[transaction.company_name] += transaction.external_amount;
    });

    Object.keys(temp_vehicle_weight).forEach(company_name => {
        if (temp_vehicle_weight[company_name] > 0) {
            this_week_vehicle_weight.push({ value: temp_vehicle_weight[company_name], label: company_name });
        }
        if (temp_external_amount[company_name] > 0) {
            this_week_external_amount.push({ value: temp_external_amount[company_name], label: company_name });
        }
    });

    //this month
    const this_month = new Date();
    const this_month_start = new Date(this_month.getFullYear(), this_month.getMonth(), 1, 0, 0, 0);
    const this_month_end = new Date(this_month.getFullYear(), this_month.getMonth() + 1, 0, 23, 59, 59);

    const this_month_transactions = transactions.filter(transaction => transaction.date_created >= this_month_start && transaction.date_created <= this_month_end);
    
    let this_month_vehicle_weight = [];
    let this_month_external_amount = [];

    temp_vehicle_weight = {};
    temp_external_amount = {};

    transactions.forEach(transaction => {
        temp_vehicle_weight[transaction.company_name] = 0;
        temp_external_amount[transaction.company_name] = 0;
    });

    this_month_transactions.forEach(transaction => {
        temp_vehicle_weight[transaction.company_name] += transaction.vehicle_weight;
        temp_external_amount[transaction.company_name] += transaction.external_amount;
    });

    Object.keys(temp_vehicle_weight).forEach(company_name => {
        if (temp_vehicle_weight[company_name] > 0) {
            this_month_vehicle_weight.push({ value: temp_vehicle_weight[company_name], label: company_name });
        }
        if (temp_external_amount[company_name] > 0) {
            this_month_external_amount.push({ value: temp_external_amount[company_name], label: company_name });
        }
    });

    return {today: {vehicle_weight: today_vehicle_weight, external_amount: today_external_amount},
            this_week: {vehicle_weight: this_week_vehicle_weight, external_amount: this_week_external_amount},
            this_month: {vehicle_weight: this_month_vehicle_weight, external_amount: this_month_external_amount}};
}




const calculateInternalTransactionWidgetData = (transactions, goods_types) =>
{
    //today
    const today = new Date();
    const today_start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const today_end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const today_transactions = transactions.filter(transaction => transaction.date_created >= today_start && transaction.date_created <= today_end);

    //we need total goods_weight, total work_amount, seperation by goods type (unlike for weight transactions where had incoming and outgoing, there is no such thing here just a disctionay of goods type and their weights)

    let today_goods_weight = [];
    let today_work_amount = [];

    // Get all types from goodsType and store in an array
    let goods_type_array = goods_types.map(goods_type => goods_type.good_name);

    // Create a dictionary to store temporary weights
    let temp_goods_weight = {};
    let temp_work_amount = {};

    goods_type_array.forEach(goods_type => {
        temp_goods_weight[goods_type] = 0;
        temp_work_amount[goods_type] = 0;
    });

    // Calculate incoming weights
    today_transactions.forEach(transaction => {
        temp_goods_weight[transaction.goods_type_id.good_name] += transaction.goods_weight;
        temp_work_amount[transaction.goods_type_id.good_name] += transaction.work_amount;
    });

    // Transform the temporary weights into the desired structure {value: weight, label: goods_type}
    goods_type_array.forEach(goods_type => {
        if (temp_goods_weight[goods_type] > 0) {
            today_goods_weight.push({ value: temp_goods_weight[goods_type], label: goods_type });
        }
        if (temp_work_amount[goods_type] > 0) {
            today_work_amount.push({ value: temp_work_amount[goods_type], label: goods_type });
        }
    });

    //this week
    const this_week = new Date();
    const this_week_start = new Date(this_week.getFullYear(), this_week.getMonth(), this_week.getDate() - this_week.getDay(), 0, 0, 0);
    const this_week_end = new Date(this_week.getFullYear(), this_week.getMonth(), this_week.getDate() + (6 - this_week.getDay()), 23, 59, 59);

    const this_week_transactions = transactions.filter(transaction => transaction.date_created >= this_week_start && transaction.date_created <= this_week_end);

    let this_week_goods_weight = [];
    let this_week_work_amount = [];

    temp_goods_weight = {};
    temp_work_amount = {};

    goods_type_array.forEach(goods_type => {
        temp_goods_weight[goods_type] = 0;
        temp_work_amount[goods_type] = 0;
    });

    this_week_transactions.forEach(transaction => {
        temp_goods_weight[transaction.goods_type_id.good_name] += transaction.goods_weight;
        temp_work_amount[transaction.goods_type_id.good_name] += transaction.work_amount;
    });

    goods_type_array.forEach(goods_type => {
        if (temp_goods_weight[goods_type] > 0) {
            this_week_goods_weight.push({ value: temp_goods_weight[goods_type], label: goods_type });
        }
        if (temp_work_amount[goods_type] > 0) {
            this_week_work_amount.push({ value: temp_work_amount[goods_type], label: goods_type });
        }
    });


    //this month
    const this_month = new Date();
    const this_month_start = new Date(this_month.getFullYear(), this_month.getMonth(), 1, 0, 0, 0);
    const this_month_end = new Date(this_month.getFullYear(), this_month.getMonth() + 1, 0, 23, 59, 59);

    const this_month_transactions = transactions.filter(transaction => transaction.date_created >= this_month_start && transaction.date_created <= this_month_end);

    let this_month_goods_weight = [];
    let this_month_work_amount = [];

    temp_goods_weight = {};
    temp_work_amount = {};

    goods_type_array.forEach(goods_type => {
        temp_goods_weight[goods_type] = 0;
        temp_work_amount[goods_type] = 0;
    });

    this_month_transactions.forEach(transaction => {
        temp_goods_weight[transaction.goods_type_id.good_name] += transaction.goods_weight;
        temp_work_amount[transaction.goods_type_id.good_name] += transaction.work_amount;
    });

    goods_type_array.forEach(goods_type => {
        if (temp_goods_weight[goods_type] > 0) {
            this_month_goods_weight.push({ value: temp_goods_weight[goods_type], label: goods_type });
        }
        if (temp_work_amount[goods_type] > 0) {
            this_month_work_amount.push({ value: temp_work_amount[goods_type], label: goods_type });
        }
    });

    return {today: {goods_weight: today_goods_weight, work_amount: today_work_amount},
            this_week: {goods_weight: this_week_goods_weight, work_amount: this_week_work_amount},
            this_month: {goods_weight: this_month_goods_weight, work_amount: this_month_work_amount}};

}


const calculateWeightTransactionWidgetData = (transactions, goods_types) =>
{

    //today
    const today = new Date();
    const today_start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const today_end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const today_transactions = transactions.filter(transaction => transaction.date_empty_weight >= today_start && transaction.date_empty_weight <= today_end);
    const today_incoming_goods = today_transactions.filter(transaction => transaction.type === "incoming");
    const today_outgoing_goods = today_transactions.filter(transaction => transaction.type === "outgoing");


    // Initialize today_goods_weight with incoming and outgoing as arrays
    let today_goods_weight = {
        incoming: [],
        outgoing: []
    };

    // Get all types from goodsType and store in an array
    let goods_type_array = goods_types.map(goods_type => goods_type.good_name);

    // Create a dictionary to store temporary weights
    let temp_goods_weight = {};
    goods_type_array.forEach(goods_type => {
        temp_goods_weight[goods_type] = { incoming: 0, outgoing: 0 };
    });

    // Calculate incoming weights
    today_incoming_goods.forEach(transaction => {
        // console.log(transaction.goods_type_id)
        temp_goods_weight[transaction.goods_type_id.good_name].incoming += transaction.goods_weight;
    });
    
    // // Calculate outgoing weights
    today_outgoing_goods.forEach(transaction => {
        temp_goods_weight[transaction.goods_type_id.good_name].outgoing += transaction.goods_weight;
    });


    // Transform the temporary weights into the desired structure
    goods_type_array.forEach(goods_type => {
        if (temp_goods_weight[goods_type].incoming > 0) {
            today_goods_weight.incoming.push({ value: temp_goods_weight[goods_type].incoming, label: goods_type });
        }
        if (temp_goods_weight[goods_type].outgoing > 0) {
            today_goods_weight.outgoing.push({ value: temp_goods_weight[goods_type].outgoing, label: goods_type });
        }
    });

    //this week

    const this_week = new Date();
    const this_week_start = new Date(this_week.getFullYear(), this_week.getMonth(), this_week.getDate() - this_week.getDay(), 0, 0, 0);
    const this_week_end = new Date(this_week.getFullYear(), this_week.getMonth(), this_week.getDate() + (6 - this_week.getDay()), 23, 59, 59);

    const this_week_transactions = transactions.filter(transaction => transaction.date_empty_weight >= this_week_start && transaction.date_empty_weight <= this_week_end);
    const this_week_incoming_goods = this_week_transactions.filter(transaction => transaction.type === "incoming");
    const this_week_outgoing_goods = this_week_transactions.filter(transaction => transaction.type === "outgoing");

    //same things as today
    let this_week_goods_weight = {
        incoming: [],
        outgoing: []
    };

    temp_goods_weight = {};
    goods_type_array.forEach(goods_type => {
        temp_goods_weight[goods_type] = { incoming: 0, outgoing: 0 };
    });

    ///same as today with goods_type_id
    this_week_incoming_goods.forEach(container => {
        temp_goods_weight[container.goods_type_id.good_name].incoming += container.goods_weight;
    })

    this_week_outgoing_goods.forEach(container => {
        temp_goods_weight[container.goods_type_id.good_name].outgoing += container.goods_weight;
    })

    goods_type_array.forEach(goods_type => {
        if (temp_goods_weight[goods_type].incoming > 0) {
            this_week_goods_weight.incoming.push({ value: temp_goods_weight[goods_type].incoming, label: goods_type });
        }
        if (temp_goods_weight[goods_type].outgoing > 0) {
            this_week_goods_weight.outgoing.push({ value: temp_goods_weight[goods_type].outgoing, label: goods_type });
        }
    })

    // //this month
    const this_month = new Date();
    const this_month_start = new Date(this_month.getFullYear(), this_month.getMonth(), 1, 0, 0, 0);
    const this_month_end = new Date(this_month.getFullYear(), this_month.getMonth() + 1, 0, 23, 59, 59);

    const this_month_transactions = transactions.filter(transaction => transaction.date_empty_weight >= this_month_start && transaction.date_empty_weight <= this_month_end);
    const this_month_incoming_goods = this_month_transactions.filter(transaction => transaction.type === "incoming");
    const this_month_outgoing_goods = this_month_transactions.filter(transaction => transaction.type === "outgoing");

    //same things as today
    let this_month_goods_weight = {
        incoming: [],
        outgoing: []
    };

    temp_goods_weight = {};
    goods_type_array.forEach(goods_type => {
        temp_goods_weight[goods_type] = { incoming: 0, outgoing: 0 };
    });

    ///same as today with goods_type_id
    this_month_incoming_goods.forEach(container => {
        temp_goods_weight[container.goods_type_id.good_name].incoming += container.goods_weight;
    })

    this_month_outgoing_goods.forEach(container => {
        temp_goods_weight[container.goods_type_id.good_name].outgoing += container.goods_weight;
    })

    goods_type_array.forEach(goods_type => {
        if (temp_goods_weight[goods_type].incoming > 0) {
            this_month_goods_weight.incoming.push({ value: temp_goods_weight[goods_type].incoming, label: goods_type });
        }
        if (temp_goods_weight[goods_type].outgoing > 0) {
            this_month_goods_weight.outgoing.push({ value: temp_goods_weight[goods_type].outgoing, label: goods_type });
        }
    })

    return {today: {incoming: today_incoming_goods.length, outgoing: today_outgoing_goods.length, goods_weight: today_goods_weight},
            this_week: {incoming: this_week_incoming_goods.length, outgoing: this_week_outgoing_goods.length, goods_weight: this_week_goods_weight},
            this_month: {incoming: this_month_incoming_goods.length, outgoing: this_month_outgoing_goods.length, goods_weight: this_month_goods_weight}};
}