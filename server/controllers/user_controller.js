//Handle all user related routes e.g. login, signup, etc
import { User,Notifications, GoodsType } from "../models/schema.js";
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
                console.log("Successful login. Going through notifications to delete old ones.")
                const employee_notifications = await Notifications.findOne({user: user_present.email});

                const current_time = new Date();
                const seven_days = 7 * 24 * 60 * 60 * 1000;

                //employee notifications time obkect from data base is in this format: 2024-06-30T15:04:26.755+00:00
                employee_notifications.notifications = employee_notifications.notifications.filter((notif) =>
                {
                    const notif_time = new Date(notif.time);
                    return (current_time - notif_time) < seven_days;
                });

                await employee_notifications.save();

                //get all goods types
                let goods_types = await GoodsType.find({});

                //get only names of goods types
                goods_types = goods_types.map((type) => type.name);


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
    const {firstName, lastName, email, password, role} = req.body;
    console.log("Create user request for email: ", email);

    try
    {
        const user_present = await User.findOne({email: email});

        if(user_present)
        {
           return res.status(400).json({message: "User already exists"});
        }

        //hash password
        const passwordHash = await bcrypt.hash(password, 10);

        await User.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            hashedPassword: passwordHash,
            role: role
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
    const {email} = req.body;
    console.log("Delete user request for email: ", email);

    try
    {
        const user_present = await User.findOne({email: email});

        if(user_present)
        {
            User.deleteOne({email: email});
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
    const {email,oldPassword, newPassword} = req.body;
    console.log("Update password request for email: ", email);

    try
    {
        const user_present = await User.findOne({email: email});

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
            
            await User.updateOne({email: email}, {hashedPassword: newPasswordHash});
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
    const {email, newPassword} = req.body;
    console.log("Reset password request for email: ", email);

    try
    {
        const user_present = await User.findOne({email: email});

        if(user_present)
        {
            //update password
            const newPasswordHash = await bcrypt.hash(newPassword, 10);

            User.updateOne({email: email}, {hashedPassword: newPasswordHash});

            //add notification to employee queue
            const employee_notifications = await Notifications.findOne({user: user_present.email});

            let notif_data = {notifType: "password_reset", data: `Your password was reset to ${newPassword}`, time: new Date()};
            employee_notifications.notifications.push(notif_data);

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