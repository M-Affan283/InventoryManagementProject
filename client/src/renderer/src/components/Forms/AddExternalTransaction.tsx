import {useEffect, useState, useContext} from 'react'
import axios from 'axios';
import { UserContext } from '../ContextStore';

const AddExternalTransaction = (props:any) => {

    // const {company_name, truck_no, driver_name, driver_contact, vehicle_weight, external_rate, employee} = req.body;
    const [companyName, setCompanyName] = useState<string>('');
    const [truckNo, setTruckNo] = useState<string>('');
    const [driverName, setDriverName] = useState<string>('');
    const [driverContact, setDriverContact] = useState<string>('');
    const [vehicleWeight, setVehicleWeight] = useState<string>('0');
    const [weightReading, setWeightReading] = useState<string>("0");
    const [amountReading, setAmountReading] = useState<string>("0"); //this will be calculated by vehicle weight * external rate displayed with weight reading
    const [externalRate, setExternalRate] = useState<string>('0');
    const [serverResponse, setServerResponse] = useState<{message:string, status:number} | null>(null);
    const [reading, setReading] = useState<boolean>(false);
    const {user,apiUrl,comPort, baudRate} = useContext(UserContext);

    useEffect(()=>
    {
        const timer = setTimeout(()=>
        {
            setServerResponse(null);
        }, 5000)

        return () => clearTimeout(timer);
    }, [serverResponse])

    const closeForm = () =>
    {
        //clear all fields
        setCompanyName('');
        setTruckNo('');
        setDriverName('');
        setDriverContact('');
        setVehicleWeight('0');
        setExternalRate('0');
        setWeightReading('0');
        setAmountReading('0');
    }

    const formSubmit = (e:any) =>
    {
        e.preventDefault();
        console.log(`Company Name: ${companyName}, Truck No: ${truckNo}, Driver Name: ${driverName}, Driver Contact: ${driverContact}, Vehicle Weight: ${vehicleWeight}, External Rate: ${externalRate}`);

        //regex

        //truck no is alphanumeric
        if(!/^[a-zA-Z0-9]*$/.test(truckNo))
        {
            setServerResponse({message: "Truck No. should be alphanumeric", status: 400});
            return;
        }

        //driver contact is numeric
        if(!/^[0-9]*$/.test(driverContact))
        {
            setServerResponse({message: "Driver Contact should be numeric", status: 400});
            return;
        }

        //vehicle weight is numeric
        if(!/^[0-9]*$/.test(vehicleWeight))
        {
            setServerResponse({message: "Vehicle Weight should be numeric", status: 400});
            return;
        }

        //external rate is numeric
        if(!/^[0-9]*$/.test(externalRate))
        {
            setServerResponse({message: "External Rate should be numeric", status: 400});
            return;
        }


        try
        {
            axios.post(`${apiUrl}/goods/addExternalTransaction`, {company_name: companyName, truck_no: truckNo, driver_name: driverName, driver_contact: driverContact, vehicle_weight: vehicleWeight, external_rate: externalRate, employee: user?.email})
            .then((res)=>
            {
                console.log(res.data);
                setServerResponse({message: res.data.message, status: 200});
                closeForm();
            })
            .catch((err)=>
            {
                console.log(err);
                setServerResponse({message: "An error occurred", status: 400});
            })

        }
        catch(err)
        {
            console.log(err);
            setServerResponse({message: "An error occurred", status: 400});
        }

    }

    const readWeight = () =>
    {
        console.log("Reading weight from serial port...");
        stopReading(); 
        setReading(true);


        //start data reading
        window.api.getWeightDataEmpty(comPort || "COM5", baudRate || 1200);

        //receive data
        let unsub = window.api.receiveEmpty('weight-data-base', (_event:any, data:any)=>
        {
            console.log("Data received: ", data);
            setVehicleWeight(data);
            setWeightReading(data);

            //if external rate set then set amount reading
            if(externalRate !== '0')
            {
                setAmountReading((parseFloat(data) * parseFloat(externalRate)).toFixed(2).toString());
            }

        })

        return () => unsub();

    }

    const stopReading = () =>
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
                        <input type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={companyName} required onChange={(e)=>setCompanyName(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Company Name</label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={truckNo} required onChange={(e)=>setTruckNo(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Truck No.</label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={driverName} required onChange={(e)=>setDriverName(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Driver Name</label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={driverContact} required onChange={(e)=>setDriverContact(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Driver Contact</label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={externalRate} required onChange={(e)=>setExternalRate(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">External Rate</label>
                    </div>
                    <br/>
                    <div className="relative z-0 w-full mb-5 group flex flex-col"> {/* Change flex direction to column */}
                        <input type="number" name="empty_weight" id="floating_first_name" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="0" value={vehicleWeight} required onChange={(e)=>{setVehicleWeight(e.target.value)}}/>
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Vehicle Weight</label>
                        {/* button here to read weight */}
                        { !reading ? <button type="button" className="text-lg text-blue-500 dark:text-blue-400 self-end mt-1" onClick={()=>{readWeight()}}>Read</button> : <button type="button" className="text-sm text-red-500 dark:text-red-400 self-end mt-1" onClick={()=>{stopReading()}}>Stop</button>}
                    </div>
                    {/* </div> */}
                    {/* submit and cancel button should show side by side */}
                    <div className="flex justify-end space-x-4">
                        {/* <button type="button" onClick={closeForm} className="text-red-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-lg px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Cancel</button> */}
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                    </div>

                </form>


                <div className="flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg w-1/2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Weight Reading:</h3>
                    <p className="text-5xl font-semibold text-gray-900 dark:text-white">{weightReading}</p>

                    <br/>
                    <br/>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Amount Reading:</h3>
                    <p className="text-5xl font-semibold text-gray-900 dark:text-white">{amountReading}</p>
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
  )
}

export default AddExternalTransaction