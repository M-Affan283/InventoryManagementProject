export const addContainer = async (req,res) =>
{
    const {type, serial_no, truck_no, driver_name, driver_contact, goods_type, empty_weight, filled_weight, goods_weight, employee} = req.body;
    console.log("Add container request for time: ", Date.now());

    try
    {

        const user_present = await User.findOne({email: employee});
        if(!user_present)
        {
            return res.status(400).json({message: "Employee not found"});
        }


        await GoodsContainer.create({
            type: type,
            serial_no: serial_no,
            truck_no: truck_no,
            driver_name: driver_name,
            driver_contact: driver_contact,
            goods_type: goods_type,
            empty_weight: empty_weight,
            filled_weight: filled_weight,
            goods_weight: goods_weight,
            date_created: new Date(),
            date_updated: new Date(), //date updated is the same as date created initially
            employee: user_present._id
        });

        return res.status(200).json({message: "Container added successfully"});
    }
    catch (error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const updateContainer = async (req,res) =>
{
    const {container_id, empty_weight, filled_weight, goods_weight} = req.body;
    console.log("Update container request for:" , container_id);

    try
    {
        const container = await GoodsContainer.findOne({_id: container_id}).populate("employee");

        if(!container)
        {
            return res.status(400).json({message: "Container not found"});
        }

        // container.type = type;
        // container.serial_no = serial_no;
        // container.truck_no = truck_no;
        // container.driver_name = driver_name;
        // container.driver_contact = driver_contact;
        // container.goods_type = goods_type;
        container.empty_weight = empty_weight;
        container.filled_weight = filled_weight;
        container.goods_weight = goods_weight;
        container.date_updated = new Date();

        //get employee + admin notifications
        const employee_notifications = await Notifications.findOne({user: container.employee.email});

        const admin = await User.findOne({role: "admin"});

        const admin_notifications = await Notifications.findOne({user: admin.email});

        //add notification for the employee that container has been updated
        let notif_data = {notifType:"container_updated", data: `Container with serial number ${container.serial_no} has been updated`, time: new Date()};
        employee_notifications.notifications.push(notif_data);
        admin_notifications.notifications.push(notif_data);


        await container.save();
        await employee_notifications.save();
        await admin_notifications.save();

        return res.status(200).json({message: "Container updated successfully"});

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }

}

export const deleteContainer = async (req,res) =>
{
    const {container_id} = req.query;
    console.log("Delete container request for:" , container_id);

    try
    {
        const container = await GoodsContainer.findOne({_id: container_id}).populate("employee");
        

        if(!container)
        {
            return res.status(400).json({message: "Container not found"});
        }

        const employee_notifications = await Notifications.findOne({user: container.employee.email});

        const admin = await User.findOne({role: "admin"});

        const admin_notifications = await Notifications.findOne({user: admin.email});

        //add notification for the employee that container has been deleted after deletion
        let notif_data = {notifType:"container_deleted", data: `Container with serial number ${container.serial_no} has been deleted`, time: new Date()};
        // console.log(employee_notifications)
        employee_notifications.notifications.push(notif_data);
        admin_notifications.notifications.push(notif_data);

        await GoodsContainer.deleteOne({_id: container_id});
        await employee_notifications.save();
        await admin_notifications.save();

        return res.status(200).json({message: "Container deleted successfully"});
    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

//add pagination to get containers
export const getContainers = async (req,res) =>
{
    const {email, searchQuery="", page=1, limit=10} = req.query;
    console.log("Get containers request for:" , email);

    try
    {
        console.log("Req: ", req.query);

        const user = await User.findOne({email: email});

        
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        
        const skip = (pageNumber - 1) * limitNumber;
        
        if(user.role === "admin")
        {
            console.log("Admin request")
            const searchFilter = searchQuery ? {
                $or: [
                    {type: {$regex: searchQuery, $options: "i"}},
                    {serial_no: {$regex: searchQuery, $options: "i"}},
                    {truck_no: {$regex: searchQuery, $options: "i"}},
                    {driver_name: {$regex: searchQuery, $options: "i"}},
                    {driver_contact: {$regex: searchQuery, $options: "i"}},
                    // {goods_weight: {$regex: searchQuery, $options: "i"}},
                    {goods_type: {$regex: searchQuery, $options: "i"}},
                    ...(isNaN(parseInt(searchQuery)) ? [] : [{goods_weight: parseInt(searchQuery)}]),
                ]
            } : {};
            
            const containers = await GoodsContainer.find(searchFilter).limit(limitNumber).skip(skip);
            return res.status(200).json({containers:containers});
        }
        else if(user.role === "employee")
        {
            console.log("Employee request")
            //add user id check here
            const searchFilter = searchQuery ? {
                $or: [
                    {type: {$regex: searchQuery, $options: "i"}},
                    {serial_no: {$regex: searchQuery, $options: "i"}},
                    {truck_no: {$regex: searchQuery, $options: "i"}},
                    {driver_name: {$regex: searchQuery, $options: "i"}},
                    {driver_contact: {$regex: searchQuery, $options: "i"}},
                    // {goods_weight: {$regex: parseInt(searchQuery), $options: "i"}},
                    {goods_type: {$regex: searchQuery, $options: "i"}},
                    ...(isNaN(parseInt(searchQuery)) ? [] : [{goods_weight: parseInt(searchQuery)}]),
                ],
                employee: user._id
            } : {employee: user._id}; //this will find all containers for the employee only

            const containers = await GoodsContainer.find(searchFilter).limit(limitNumber).skip(skip);
            return res.status(200).json({containers:containers});
        }


    }
    catch (error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getIndividualContainer = async (req,res) =>
{
    const {container_id} = req.query;
    console.log("Get individual container request for:" , container_id);
    
    try
    {
        const container = await GoodsContainer.findOne({_id: container_id});
        return res.status(200).json({container:container});
    }
    catch (error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

//should contin data for today, this week, this month, this quarter (if possible)
//shoudl contain //DASHOARD TO CONTAIN SUMMARY. TODAY, FOR THIS WEEK, FOR THIS MONTH, FOR THIS QUARTER. TOTAL TRUCKS INCOMING/OUTGOING. Types of item and their weight that came and went.
export const widgetData = async (req,res) =>
{
    const {email} = req.query;
    console.log("Widget data request for:" , email);

    try
    {

        const user = await User.findOne({email: email});

        if(!user)
        {
            return res.status(400).json({message: "User not found"});
        }

        if(user.role === 'admin')
        {
            //get all containers for today, this week, this month, this quarter. and calculate stuff as needed
            const containers = await GoodsContainer.find({});
            const goods_types = await GoodsType.find({});

            let return_data = calculateWidgetData(containers, goods_types);

            return res.status(200).json({data: return_data});
        }
        else if(user.role === 'employee')
        {
            //get all containers for this employee only for today, this week, this month, this quarter. and calculate stuff as needed
            const containers = await GoodsContainer.find({employee: user._id});
            const goods_types = await GoodsType.find({});

            let return_data = calculateWidgetData(containers, goods_types);

            return res.status(200).json({data: return_data});
        }

    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const addType = async (req,res) =>
{
    const {name} = req.body;

    try
    {
        await GoodsType.create({name: name});
        return res.status(200).json({message: "Goods type added successfully"});
    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getAllTypes = async (req,res) =>
{
    console.log("Get all types request");

    try
    {
        let goods_types = await GoodsType.find({});
        //get only names of goods types
        goods_types = goods_types.map((type) => type.name);
        return res.status(200).json({types:goods_types});
    }
    catch(error)
    {
        console.log("Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}

const calculateWidgetData = (containers, goods_types) =>
{
    //get today's containers=> total incoming and outgoing containers, type of goods and their weight respectively
    const today = new Date();
    const today_start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const today_end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const today_containers = containers.filter(container => container.date_created >= today_start && container.date_created <= today_end);
    const today_incoming_goods = today_containers.filter(container => container.type === "Incoming");
    const today_outgoing_goods = today_containers.filter(container => container.type === "Outgoing");

    // Initialize today_goods_weight with incoming and outgoing as arrays
    let today_goods_weight = {
        incoming: [],
        outgoing: []
    };

    // Get all types from goodsType and store in an array
    let goods_type_array = goods_types.map(goods_type => goods_type.name);

    // Create a dictionary to store temporary weights
    let temp_goods_weight = {};
    goods_type_array.forEach(goods_type => {
        temp_goods_weight[goods_type] = { incoming: 0, outgoing: 0 };
    });

    // Calculate incoming weights
    today_incoming_goods.forEach(container => {
        temp_goods_weight[container.goods_type].incoming += container.goods_weight;
    });

    // Calculate outgoing weights
    today_outgoing_goods.forEach(container => {
        temp_goods_weight[container.goods_type].outgoing += container.goods_weight;
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

    //get this week's containers=> total incoming and outgoing containers, type of goods and their weight respectively
    const this_week = new Date();
    const this_week_start = new Date(this_week.getFullYear(), this_week.getMonth(), this_week.getDate() - this_week.getDay(), 0, 0, 0);
    const this_week_end = new Date(this_week.getFullYear(), this_week.getMonth(), this_week.getDate() + (6 - this_week.getDay()), 23, 59, 59);

    const this_week_containers = containers.filter(container => container.date_created >= this_week_start && container.date_created <= this_week_end);
    // console.log("This week containers: ", this_week_containers)
    const this_week_incoming_goods = this_week_containers.filter(container => container.type === "Incoming");
    const this_week_outgoing_goods = this_week_containers.filter(container => container.type === "Outgoing");

    //same things as today
    let this_week_goods_weight = {
        incoming: [],
        outgoing: []
    };

    temp_goods_weight = {};
    goods_type_array.forEach(goods_type => {
        temp_goods_weight[goods_type] = { incoming: 0, outgoing: 0 };
    });

    this_week_incoming_goods.forEach(container => {
        temp_goods_weight[container.goods_type].incoming += container.goods_weight;
    });

    this_week_outgoing_goods.forEach(container => {
        temp_goods_weight[container.goods_type].outgoing += container.goods_weight;
    });

    goods_type_array.forEach(goods_type => {
        if (temp_goods_weight[goods_type].incoming > 0) {
            this_week_goods_weight.incoming.push({ value: temp_goods_weight[goods_type].incoming, label: goods_type });
        }
        if (temp_goods_weight[goods_type].outgoing > 0) {
            this_week_goods_weight.outgoing.push({ value: temp_goods_weight[goods_type].outgoing, label: goods_type });
        }
    });

    //get this month's containers=> total incoming and outgoing containers, type of goods and their weight respectively
    const this_month = new Date();
    const this_month_start = new Date(this_month.getFullYear(), this_month.getMonth(), 1, 0, 0, 0);
    const this_month_end = new Date(this_month.getFullYear(), this_month.getMonth() + 1, 0, 23, 59, 59);

    const this_month_containers = containers.filter(container => container.date_created >= this_month_start && container.date_created <= this_month_end);
    const this_month_incoming_goods = this_month_containers.filter(container => container.type === "Incoming");
    const this_month_outgoing_goods = this_month_containers.filter(container => container.type === "Outgoing");

    //same things as today
    let this_month_goods_weight = {
        incoming: [],
        outgoing: []
    };

    temp_goods_weight = {};
    goods_type_array.forEach(goods_type => {
        temp_goods_weight[goods_type] = { incoming: 0, outgoing: 0 };
    });

    this_month_incoming_goods.forEach(container => {
        temp_goods_weight[container.goods_type].incoming += container.goods_weight;
    });

    this_month_outgoing_goods.forEach(container => {
        temp_goods_weight[container.goods_type].outgoing += container.goods_weight;
    });

    goods_type_array.forEach(goods_type => {
        if (temp_goods_weight[goods_type].incoming > 0) {
            this_month_goods_weight.incoming.push({ value: temp_goods_weight[goods_type].incoming, label: goods_type });
        }
        if (temp_goods_weight[goods_type].outgoing > 0) {
            this_month_goods_weight.outgoing.push({ value: temp_goods_weight[goods_type].outgoing, label: goods_type });
        }
    });

    return {today: {incoming: today_incoming_goods.length, outgoing: today_outgoing_goods.length, goods_weight: today_goods_weight},
            this_week: {incoming: this_week_incoming_goods.length, outgoing: this_week_outgoing_goods.length, goods_weight: this_week_goods_weight},
            this_month: {incoming: this_month_incoming_goods.length, outgoing: this_month_outgoing_goods.length, goods_weight: this_month_goods_weight}};
}