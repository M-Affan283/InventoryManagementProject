//Handle all user related routes e.g. login, signup, etc
import { User,Notifications, GoodsType, Contractor, ContractorWork, Vendor } from "../models/schema.js";
import bcrypt from "bcryptjs";

export const login = async (req,res) => 
{
    const {email, password} = req.body;
    console.log("Login request for email: ", email);

    try
    {

        const user_present = await User.findOne({email: email});

        if(user_present)
        {
            const password_check = await bcrypt.compare(password, user_present.hashedPassword);

            if(password_check)
            {

                //get employee's notifications and delete all which are older than 7 days
                console.log("Successful login.")
                // const employee_notifications = await Notifications.findOne({user: user_present.email});

                // const current_time = new Date();
                // const seven_days = 7 * 24 * 60 * 60 * 1000;

                // //employee notifications time obkect from data base is in this format: 2024-06-30T15:04:26.755+00:00
                // employee_notifications.notifications = employee_notifications.notifications.filter((notif) =>
                // {
                //     const notif_time = new Date(notif.time);
                //     return (current_time - notif_time) < seven_days;
                // });

                // await employee_notifications.save();

                //get all goods types
                let goods_types = await GoodsType.find({});

                //get only names and id of goods types and store as object
                goods_types = goods_types.map((type) => {
                    return {good_name: type.good_name, good_code: type.good_code, good_rate: type.good_rate};
                });

                return res.status(200).json({message: "Login successful", user: user_present, goods_types: goods_types});
            }
            else
            {
                return res.status(400).json({message: "Incorrect email or password"});
            }
        }
        else
        {
            return res.status(400).json({message: "Incorrect email or password"});
        }

    }
    catch (error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

//for admin
export const createUser = async (req,res) =>
{
    const {firstName, lastName, email, password, role, creator_email} = req.body;
    console.log("Create user request for email: ", email);

    try
    {
        const user_present = await User.findOne({email: email});

        if(user_present)
        {
           return res.status(400).json({message: "User already exists"});
        }

        const creator = await User.findOne({email: creator_email});

        if(!creator)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        if(creator.role !== "admin")
        {
            return res.status(400).json({message: "Only admin can create user"});
        }

        //hash password
        const passwordHash = await bcrypt.hash(password, 10);

        await User.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            hashedPassword: passwordHash,
            role: role,
            date_created: new Date(),
            created_by: creator._id,
            // date_updated: new Date(),
            is_deleted: false,
            date_deleted: null,
            delete_by: null,
            delete_reason: null
        });

        await Notifications.create({
            user: email,
            notifications: []
        });

        return res.status(200).json({message: `User ${email} created successfully`});


    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const deleteUser = async (req,res) =>
{
    const {email, deletedBy} = req.body;
    console.log("Delete user request for email: ", email);

    try
    {
        const user_present = await User.findOne({email: email});
        const deletor = await User.findOne({email: deletedBy});

        if(user_present)
        {
            //delete user

            if(deletedBy.role !== "admin")
            {
                return res.status(400).json({message: "Only admin can delete user"});
            }

            if(user_present.is_deleted)
            {
                return res.status(400).json({message: "User already deleted"});
            }

            const admin_notifications = await Notifications.findOne({user: deletor.email});

            let notif_data = {notifType: "user_delete", data: `User ${email} was deleted by ${deletedBy.email}`, time: new Date()};

            admin_notifications.notifications.push(notif_data);



            user_present.is_deleted = true;
            user_present.date_deleted = new Date();
            user_present.delete_by = deletor._id;
            user_present.delete_reason = "Deleted by admin";
            await user_present.save();
            await admin_notifications.save();


            return res.status(200).json({message: `User ${email} deleted successfully`});
        }
        else
        {
            return res.status(400).json({message: "User does not exist"});
        }

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}



export const updatePassword = async (req,res) =>
{
    const {email,oldPassword, newPassword, updator_email} = req.body;
    console.log("Update password request for email: ", email);

    try
    {
        const user_present = await User.findOne({email: email});
        const updator = await User.findOne({email: updator_email})

        if(updator.role !== "admin")
        {
            return res.status(400).json({message: "Only admin can update password"});
        }

        if(user_present)
        {
            const password_check = await bcrypt.compare(oldPassword, user_present.hashedPassword);

            if(!password_check)
            {
                return res.status(400).json({message: "Incorrect old password"});
            }
        
            //update password
            const newPasswordHash = await bcrypt.hash(newPassword, 10);

            
            //add notification to employee queue
            const employee_notifications = await Notifications.findOne({user: user_present.email});
            
            const admin = await User.findOne({role: "admin"});
            
            const admin_notifications = await Notifications.findOne({user: admin.email});
            
            let notif_data = {notifType: "password_change", data: `${email} password was updated to ${newPassword}`, time: new Date()};
            employee_notifications.notifications.push(notif_data);
            admin_notifications.notifications.push(notif_data);
            
            
            user_present.hashedPassword = newPasswordHash;
            user_present.date_updated = new Date();
            user_present.updated_by = admin._id;
            await user_present.save();

            await employee_notifications.save();
            await admin_notifications.save();
            
            return res.status(200).json({message: `Password updated successfully for ${email}`});
        }
        else
        {
            return res.status(400).json({message: "User does not exist"});
        }
    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }


}

export const resetPassword = async (req,res) =>
{
    const {email, newPassword, updator_email} = req.body;
    console.log("Reset password request for email: ", email);

    try
    {
        const user_present = await User.findOne({email: email});
        const updator = await User.findOne({email: updator_email})

        if(updator.role !== "admin")
        {
            return res.status(400).json({message: "Only admin can reset password"});
        }

        if(user_present)
        {
            //update password
            const newPasswordHash = await bcrypt.hash(newPassword, 10);

            
            //add notification to employee queue
            const employee_notifications = await Notifications.findOne({user: user_present.email});
            
            let notif_data = {notifType: "password_reset", data: `Your password was reset to ${newPassword}`, time: new Date()};
            employee_notifications.notifications.push(notif_data);
            
            user_present.hashedPassword = newPasswordHash;
            user_present.date_updated = new Date();
            user_present.updated_by = updator._id;
            await user_present.save();
            await employee_notifications.save();

            return res.status(200).json({message: `Password reset successfully for ${email}`});
        }
        else
        {
            return res.status(400).json({message: "User does not exist"});
        }


    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getAllUsers = async (req,res) =>
{
    //similar pagination as goods
    try
    {

        console.log("Req: ", req.query);
        const {searchQuery="", page=1, limit=10} = req.query;

        const searchFilter = searchQuery ? {
            $or: [
                {firstName: {$regex: searchQuery, $options: "i"}},
                {lastName: {$regex: searchQuery, $options: "i"}},
                {email: {$regex: searchQuery, $options: "i"}},
                {role: {$regex: searchQuery, $options: "i"}}
            ]
        } : {};
        
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const skip = (pageNumber - 1) * limitNumber;

        const employees = await User.find(searchFilter).limit(limitNumber).skip(skip);

        return res.status(200).json({employees: employees});
        

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getUserNotifications = async (req,res) =>
{
    const {email} = req.query;

    console.log("Get notifications request for email: ", email);

    try
    {

        const user_present = await User.findOne({email});

        if(user_present)
        {
            const notifications = await Notifications.findOne({user: user_present.email});
            // console.log(notifications)
            return res.status(200).json({notifications: notifications.notifications});
        }

        return res.status(400).json({message: "User does not exist"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

//add labourer
export const addContractor = async (req,res) =>
{
    const {contractor_code, contractor_name, contractor_contact, created_by} = req.body;
    console.log("Add contractor request for time: ", Date.now());

    try
    {
        const user_present = await User.findOne({email: created_by});
        if(!user_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        await Contractor.create({
            contractor_code: contractor_code,
            contractor_name: contractor_name,
            contractor_contact: contractor_contact,
            date_created: new Date(),
            created_by: user_present._id,
            // date_updated: new Date()
        });

        return res.status(200).json({message: "Contractor added successfully"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

//delete labourer
export const deleteContractor = async (req,res) =>
{
    const {contractor_code, delete_reason, employee} = req.body;
    console.log("Delete contractor request for time: ", Date.now());

    try
    {
        const contractor = await Contractor.findOne({contractor_code: contractor_code});

        if(!contractor)
        {
            return res.status(400).json({message: "Contractor not found"});
        }

        if(contractor.is_deleted)
        {
            return res.status(400).json({message: "Contractor already deleted"});
        }

        const user_present = await User.findOne({email: employee});

        if(!user_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        contractor.is_deleted = true;
        contractor.date_deleted = new Date();
        contractor.delete_by = user_present._id;
        contractor.delete_reason = delete_reason;
        await contractor.save();

        return res.status(200).json({message: "Contractor deleted successfully"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

//list all labourers
export const getAllContractors = async (req,res) =>
{
    console.log("Get all labourers request");

    try
    {
        console.log("Req: ", req.query);
        const {searchQuery="", page=1, limit=10} = req.query;

        const searchFilter = searchQuery ? {
            $or: [
                {contractor_code: {$regex: searchQuery, $options: "i"}},
                {contractor_name: {$regex: searchQuery, $options: "i"}},
                {contractor_contact: {$regex: searchQuery, $options: "i"}}
            ]
        } : {};

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const skip = (pageNumber - 1) * limitNumber;

        const contractors = await Contractor.find(searchFilter).limit(limitNumber).skip(skip);

        const contractorsWithTotalAmount = await Promise.all(
            contractors.map(async (contractor) => {
                const contractor_works = await ContractorWork.find({ contractor_id: contractor._id });
                let total_amount = 0;
                contractor_works.forEach((work) => {
                    total_amount += work.work_amount;
                });
                return {
                    ...contractor.toObject(),
                    total_amount
                };
            })
        );
    
        return res.status(200).json({ contractors: contractorsWithTotalAmount });
    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}   


export const addVendor = async (req,res) =>
{
    const {vendor_name, vendor_contact, vendor_poc, created_by} = req.body;

    console.log("Add vendor request");

    try
    {
        const user_present = await User.findOne({email: created_by});
        if(!user_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        await Vendor.create({
            // vendor_code: vendor_code,
            vendor_name: vendor_name,
            vendor_contact: vendor_contact,
            vendor_poc: vendor_poc,
            date_created: new Date(),
            created_by: user_present._id,
            // date_updated: new Date()
        });

        return res.status(200).json({message: "Vendor added successfully"});
    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const deleteVendor = async (req,res) =>
{
    const {vendor_code, delete_reason, employee} = req.body;
    console.log("Delete vendor request");

    try
    {
        const vendor = await Vendor.findOne({vendor_code: vendor_code});

        if(!vendor)
        {
            return res.status(400).json({message: "Vendor not found"});
        }

        if(vendor.is_deleted)
        {
            return res.status(400).json({message: "Vendor already deleted"});
        }

        const user_present = await User.findOne({email: employee});

        if(!user_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }

        vendor.is_deleted = true;
        vendor.date_deleted = new Date();
        vendor.delete_by = user_present._id;
        vendor.delete_reason = delete_reason;
        await vendor.save();

        return res.status(200).json({message: "Vendor deleted successfully"});
    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getAllVendors = async (req,res) =>
{
    console.log("Get all vendors request");

    try
    {
        console.log("Req: ", req.query);
        const {searchQuery="", page=1, limit=10} = req.query;

        const searchFilter = searchQuery ? {
            $or: [
                {vendor_name: {$regex: searchQuery, $options: "i"}},
                {vendor_contact: {$regex: searchQuery, $options: "i"}},
                {vendor_poc: {$regex: searchQuery, $options: "i"}}
            ]
        } : {};

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const skip = (pageNumber - 1) * limitNumber;

        const vendors = await Vendor.find(searchFilter).limit(limitNumber).skip(skip);

        return res.status(200).json({ vendors: vendors });
    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}