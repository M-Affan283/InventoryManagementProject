import {useEffect, useState, useContext} from 'react'
import axios from 'axios';
import { UserContext } from '../ContextStore';
import { Dropdown } from "flowbite-react";

const AddWeightOutTransaction = (props:any) => {

    //state to manage form visibility
    const [goodsTypeDropdownOpen, setGoodsTypeDropdownOpen] = useState<boolean>(false);
    const [goodsTypeDropdownValue, setGoodsTypeDropdownValue] = useState<any>({good_name: "Goods Type", good_code:'0'}); //default value
    const [reading, setReading] = useState<boolean>(false);
    
    const [vendorDropDownValue, setVendorDropDownValue] = useState<any>({vendor_name: "Vendor Name", vendor_code: '0'}); //default value
    
    const {user, comPort, baudRate, goodsType, vendors, apiUrl} = useContext(UserContext);
    
    // const [truckNo, setTruckNo] = useState<string>();
    const [containerNo, setContainerNo] = useState<string>();
    const [truckWeight, setTruckWeight] = useState<string>();
    const [containerWeight, setContainerWeight] = useState<string>("");
    const [truckContainerWeight, setTruckContainerWeight] = useState<string>(); //truck + container weight
    const [truckContainerGoodsWeight, setTruckContainerGoodsWeight] = useState<string>(); //truck + container + goods weight
    // const [emptyWeight, setemptyWeight] = useState<string>();
    // const [filledWeight, setfilledWeight] = useState<string>();
    const [goodsWeight, setGoodsWeight] = useState<string>("");
    const [weightReading, setWeightReading] = useState<string>("0"); //this is a front end thing that will display weight reading on the right side of the form. It will be big and bold. For easier reading for client.
    const [driverName, setDriverName] = useState<string>();
    const [driverContact, setDriverContact] = useState<string>();
    const [vendorName, setVendorName] = useState<string>();
    //server response will be an object containing message and status
    const [serverResponse, setServerResponse] = useState<{message:string, status:number} | null>(null);
    
    useEffect(()=>
    {
        calculateGoodsWeight();
    },[truckWeight, truckContainerWeight, truckContainerGoodsWeight])
    
    const calculateGoodsWeight = () => 
    {
        // const goodsWeight = parseFloat(filledWeight || '0') - parseFloat(emptyWeight || '0');
        // setGoodsWeight(goodsWeight.toFixed(2).toString());

        const containerWeight = parseFloat(truckContainerWeight || '0') - parseFloat(truckWeight || '0');
        setContainerWeight(containerWeight.toFixed(2).toString());

        if(truckContainerGoodsWeight)
        {
            const goodsWeight = parseFloat(truckContainerGoodsWeight || '0') - parseFloat(truckContainerWeight || '0');
            setGoodsWeight(goodsWeight.toFixed(2).toString());
        }
        else
        {
            setGoodsWeight("0");
        }

    }

    useEffect(()=>
    {
        const timer = setTimeout(()=>
        {
            setServerResponse(null);
        }, 5000)

        return () => clearTimeout(timer);
    }, [serverResponse])

    
    // const openForm = () => setIsFormOpen(true);
    const closeForm = () => 
    {
        //clear all fields
        setContainerNo('');
        setDriverName('');
        setDriverContact('');
        setVendorName('');
        setTruckWeight('0');
        setContainerWeight('0');
        setTruckContainerWeight('0');
        setTruckContainerGoodsWeight('0');
        // setemptyWeight('0'); 
        // setfilledWeight('0'); 
        setGoodsWeight('0'); 
        // setEmptyContainer(false); 
        setGoodsTypeDropdownValue('Goods Type')
    };

    // const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    // const toggleGoodsTypeDropdown = () => setGoodsTypeDropdownOpen(!goodsTypeDropdownOpen);

    const handleGoodsTypeDropdownChange = (value:any) =>
    {
        setGoodsTypeDropdownValue(value);
        setGoodsTypeDropdownOpen(false);
    }

    
    const formSubmit = (e:any) =>
    {
        e.preventDefault();
        console.log("Sending container info to server...")
        console.log("Data: ", containerNo, "\n", driverName, "\n", driverContact, "\n", vendorDropDownValue, "\n" , goodsTypeDropdownValue.good_code, "\n", truckWeight, "\n", containerWeight, "\n", truckContainerGoodsWeight, "\n", goodsWeight, "\n", user?.email);

        if(!containerNo || !driverName || !driverContact || vendorDropDownValue.vendor_name === "Vendor Name" || goodsTypeDropdownValue.good_name === "Goods Type")
        {
            console.log("Please fill all fields");
            setServerResponse({message: "Please fill all fields", status: 400});
            // closeForm();
            return;
        }

        //regex checks
        //container no is alphanumeric
        if(!/^[a-zA-Z0-9]*$/.test(containerNo))
        {
            console.log("Invalid container number");
            setServerResponse({message: "Invalid container number", status: 400});
            // closeForm();
            return;
        }

        //driver name is alphabets only
        if(!/^[a-zA-Z ]*$/.test(driverName))
        {
            console.log("Invalid driver name");
            setServerResponse({message: "Invalid driver name", status: 400});
            // closeForm();
            return;
        }

        //driver contact is numeric
        if(!/^[0-9]*$/.test(driverContact))
        {
            console.log("Invalid driver contact");
            setServerResponse({message: "Invalid driver contact", status: 400});
            // closeForm();
            return;
        }

        try
        {
            axios.post(`${apiUrl}/goods/addWeighingTransaction`, {
                type: "outgoing",
                container_no: containerNo,
                driver_name: driverName,
                driver_contact: driverContact,
                vendor_code: vendorDropDownValue.vendor_code,
                good_code: goodsTypeDropdownValue.good_code,
                truck_weight: 0,
                container_weight: parseFloat(containerWeight || '0'),
                goods_weight: parseFloat(goodsWeight || '0'),
                employee: user?.email
            })
            .then((res)=>
            {
                if(res.status === 200)
                {
                    console.log("Container added successfully");
                    setServerResponse({message: "Container added successfully", status: 200});
                    closeForm();
                }
                else
                {
                    console.log("Failed to add container: ", res.data.message);
                    setServerResponse({message: `Failed to add container: ${res.data.message}`, status: 400});
                    // closeForm();
                }
            })
            .catch((err)=>
            {
                console.log("Failed to add container: ", err.response.data.message);
                setServerResponse({message: `Failed to add container: ${err.response.data.message}`, status: 400});
                // closeForm();
            })

        }
        catch(error)
        {
            console.log("Failed to add container: ", error);
            setServerResponse({message: "Failed to add container", status: 400});
            // closeForm();
        }

    }

    const readWeightEmpty = (param:string) =>
    {
        console.log("Reading weight from serial port...");
        stopReadingEmpty(); 
        setReading(true);


        //start data reading
        window.api.getWeightDataEmpty(comPort || "COM5", baudRate || 1200);

        //receive data
        let unsub = window.api.receiveEmpty('weight-data-base', (_event:any, data:any)=>
        {
            console.log("Data received: ", data);
            if(param==="truck") setTruckWeight(data);
            else if(param === "truckContainer") setTruckContainerWeight(data);
            else if(param === "truckContainerGoods") setTruckContainerGoodsWeight(data);
            setWeightReading(data);
        })

        return () => unsub();
    }

    const readWeightFilled = (param:string) =>
    {
        console.log("Reading weight from serial port...");
        stopReadingFilled(); 
        setReading(true);


        //start data reading
        window.api.getWeightDataFilled(comPort || "COM5", baudRate || 1200);

        //receive data
        let unsub = window.api.receiveFilled('weight-data-final', (_event:any, data:any)=>
        {
            // console.log("Data received: ", data);
            if(param==="truck") setTruckWeight(data);
            else if(param === "truckContainer") setTruckContainerWeight(data);
            else if(param === "truckContainerGoods") setTruckContainerGoodsWeight(data);
            setWeightReading(data);
        })

        return () => unsub();
    }

    const stopReadingEmpty = () =>
    {
        console.log("Closing Port....")
        setReading(false);
        setWeightReading("0");
        window.api.closePort().then((data)=>console.log(data));
    }

    const stopReadingFilled = () =>
    {
        console.log("Closing Port....")
        setReading(false);
        setWeightReading("0");
        window.api.closePort().then((data)=>console.log(data));
    }

  return (

    <div>

        {/* CARD */}
        <div className="flex justify-center items-center">

            {/* alert for server response */}
            {serverResponse ? serverResponse.status === 200 ? (
                <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-green-900 dark:text-green-400 w-full" role="alert">
                    <span className="font-medium">{serverResponse.message}</span>
                </div>
            ) : serverResponse.status === 400 ? (
                <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-400 w-full" role="alert">
                    <span className="font-medium">{serverResponse.message}</span>
                </div>
            ) : null : null
            }

        </div>


        {/* Form here there will also be a weight reading div bu its side. So it will be a grid like layout. It should be in the centre of the screen */}

        { props.desktopApp &&
            <div className='flex justify-center items-center'>
            {/* make this for wider */}
            <form className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full dark:text-white" onSubmit={formSubmit}>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white"></h2>
                    <br/>
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={containerNo} required onChange={(e)=>setContainerNo(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Container No.</label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={driverName} required onChange={(e)=>setDriverName(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Driver Name</label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={driverContact} required onChange={(e)=>setDriverContact(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Driver Contact</label>
                    </div>

                    <div className="relative z-100 w-full mb-5 group">
                        
                        <Dropdown label={vendorDropDownValue.vendor_name} style={{backgroundColor: "#2563EB", outline: "none", border: "none", color: "white", borderRadius: "0.5rem", cursor: "pointer"}}>
                        
                        {vendors.map((vendor:any, index) => (
                            <Dropdown.Item key={index} onClick={()=> setVendorDropDownValue(vendor)}>{vendor.vendor_name + " ---- " + vendor.vendor_code}</Dropdown.Item>
                        ))}
                    
                        </Dropdown>
                    </div>
                    {/* <br/> */}
                    <div className="relative z-100 w-full mb-5 group">
                        
                        {/* //style must be same as above button and li */}
                        <Dropdown label={goodsTypeDropdownValue.good_name} style={{backgroundColor: "#2563EB", outline: "none", border: "none", color: "white", borderRadius: "0.5rem", cursor: "pointer"}}>
                        
                            {goodsType.map((type:any, index) => (
                                <Dropdown.Item key={index} onClick={()=> handleGoodsTypeDropdownChange(type)}>{type.good_name + " ---- " + type.good_code}</Dropdown.Item>
                            ))}
                        
                        </Dropdown>
                    </div>

                    <div className="grid md:grid-cols-2 md:gap-6">
                            <div className="relative z-0 w-full mb-5 group flex flex-col">
                                
                                <input type="number" name="empty_weight" id="floating_first_name" className={`block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`} placeholder="0" value={truckContainerWeight} required onChange={(e)=>{setTruckContainerWeight(e.target.value);}} />
                                <label className={`peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 `}>Truck + Container Weight</label>
                                
                                { !reading ? <button type="button" className={`text-lg text-blue-500 dark:text-blue-400 self-end mt-1`} onClick={()=>readWeightFilled("truckContainer")}>Read</button> : <button type="button" className={`text-sm text-red-500 dark:text-red-400 self-end mt-1`} onClick={()=>stopReadingFilled()}>Stop</button>}
                            </div>
                            <div className="relative z-0 w-full mb-5 group flex flex-col">
                                <input type="number" name="empty_weight" id="floating_first_name" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="0" value={truckWeight} required onChange={(e)=>{setTruckWeight(e.target.value);}} />
                                <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Truck Weight</label>
                                
                                { !reading ? <button type="button" className="text-lg text-blue-500 dark:text-blue-400 self-end mt-1" onClick={()=>{readWeightEmpty("truck")}}>Read</button> : <button type="button" className="text-sm text-red-500 dark:text-red-400 self-end mt-1" onClick={()=>{stopReadingEmpty()}}>Stop</button>}
                            </div>
                    </div>
                    
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="number" name="goods_weight" value={containerWeight} id="floating_phone" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="0" required readOnly/>
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Container Weight</label>
                    </div>
                    
                    <div className="relative z-0 w-full mb-5 group flex flex-col">
                        <input type="number" name="empty_weight" id="floating_first_name" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="0" value={truckContainerGoodsWeight} onChange={(e)=>{setTruckContainerGoodsWeight(e.target.value);}} />
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Total Weight (Leave empty if not measured)</label>
                        
                        { !reading ? <button type="button" className="text-lg text-blue-500 dark:text-blue-400 self-end mt-1" onClick={()=>{readWeightEmpty("truckContainerGoods")}}>Read</button> : <button type="button" className="text-sm text-red-500 dark:text-red-400 self-end mt-1" onClick={()=>{stopReadingEmpty()}}>Stop</button>}
                    </div>

                    <div className="relative z-0 w-full mb-5 group">
                        <input type="number" name="goods_weight" value={goodsWeight} id="floating_phone" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required readOnly/>
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Goods Weight</label>
                    </div>

                   
                   
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={closeForm} className="text-red-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-lg px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Cancel</button>
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                    </div>

                </form>


                <div className="flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg w-1/2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Weight Reading:</h3>
                    <p className="text-5xl font-semibold text-gray-900 dark:text-white">{weightReading}</p>
                </div>
        </div>
        }

        {!props.desktopApp && (
            <div className="p-4 mb-4 text-lg text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 w-full" role="alert">
                <span className="font-medium">Please use the desktop app to fill in this form.</span>
                {/* <button type="button" onClick={closeForm} className="text-red-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Ok</button> */}
            </div>
        )}


    </div>
  );
}

export default AddWeightOutTransaction;