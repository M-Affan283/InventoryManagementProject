import {useEffect, useState, useContext} from 'react'
import axios from 'axios';
import { UserContext } from '../ContextStore';

const AddContractorWork = (props:any) => {

    const [goodsTypeDropdownOpen, setGoodsTypeDropdownOpen] = useState<boolean>(false);
    const [goodsTypeDropdownValue, setGoodsTypeDropdownValue] = useState<any>({good_name: "Goods Type", good_code:'0'}); //default value
    const [contractorCode, setContractorCode] = useState<string>("");
    // const [emptyWeight, setemptyWeight] = useState<string>();
    // const [filledWeight, setfilledWeight] = useState<string>();
    const [goodWeight, setGoodWeight] = useState<string>();
    const [garbageWeight, setGarbageWeight] = useState<string>();
    const [weightReading, setWeightReading] = useState<string>("0"); 
    const [workAmountReading, setWorkAmountReading] = useState<string>("0"); //this will be calculated by multiplying weight with rate of goods [good_rate] displayed along with weight reading
    const [reading, setReading] = useState<boolean>(false);
    const [serverResponse, setServerResponse] = useState<{message:string, status:number} | null>(null);
    
    const {user, comPort, baudRate, goodsType,apiUrl} = useContext(UserContext);

    useEffect(()=>
    {
        const timer = setTimeout(()=>
        {
            setServerResponse(null);
        }, 5000)

        return () => clearTimeout(timer);
    }, [serverResponse])

    // const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const toggleGoodsTypeDropdown = () => setGoodsTypeDropdownOpen(!goodsTypeDropdownOpen);
    // const isEmptyContainer = () => setEmptyContainer(!emptyContainer);
    const closeForm = () =>
    {
        //clear all fields
        setContractorCode("");
        setGoodWeight("0");
        setWeightReading("0");
        setWorkAmountReading("0");
        setGarbageWeight("0");  
        // setServerResponse(null);
        setGoodsTypeDropdownValue({good_name: "Goods Type", good_code:'0'});
    }

    const handleGoodsTypeDropdownChange = (value:any) =>
    {
        setGoodsTypeDropdownValue(value);
        setGoodsTypeDropdownOpen(false);
    }

    const formSubmit = (e:any) =>
    {
        e.preventDefault();
        console.log(`Details: ${contractorCode}, ${goodsTypeDropdownValue}, ${goodWeight}, ${garbageWeight}`)
        
        try
        {
            axios.post(`${apiUrl}/goods/addContractorWork`, {contractor_code: contractorCode, goods_code: goodsTypeDropdownValue.good_code, goods_weight: goodWeight, garbage_weight: garbageWeight, employee: user?.email})
            .then((res)=>
            {
                console.log("Contractor work added");
                setServerResponse({message: res.data.message, status: 200});
                closeForm();
            })
            .catch((err)=>
            {
                console.log("Failed to add contractor work", err);
                setServerResponse({message: err.response.data.message, status: 400});
            })

        }
        catch(error)
        {
            console.log("Failed to add contractor work", error);
            setServerResponse({message: "Failed to add contractor work", status: 400});
            // closeForm();
        }
    }

    const readWeightFilled = () =>
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
            setGoodWeight(data);
            setWeightReading(data);
            setWorkAmountReading((parseFloat(data) * goodsTypeDropdownValue.good_rate).toFixed(2).toString());
        })

        return () => unsub();
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
                        <input type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={contractorCode} required onChange={(e)=>setContractorCode(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Contractor Code </label>
                    </div>
                    <div className="relative z-100 w-full mb-5 group">
                        {/* convert to dropdown */}
                        <button id="dropdownDefaultButton" onClick={toggleGoodsTypeDropdown} data-dropdown-toggle="dropdown" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">{goodsTypeDropdownValue.good_name}<svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                        </svg>
                        </button>

                        {/* <!-- Dropdown menu --> */}
                        <div id="dropdown" className={`${goodsTypeDropdownOpen ? 'block' : 'hidden'} z-50 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 absolute top-full mt-1`}>
                            <ul className="py-2 text-base text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                                {goodsType.map((type:any, index) => (
                                    <li key={index}>
                                        <a 
                                            href="#" 
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" 
                                            onClick={() => handleGoodsTypeDropdownChange(type)}
                                        >
                                            {type.good_name + " ---- " + type.good_code}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    
                    <div className="relative z-0 w-full mb-5 group flex flex-col"> {/* Change flex direction to column */}
                        <input type="number" name="empty_weight" id="floating_first_name" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="0" value={goodWeight} required onChange={(e)=>{setGoodWeight(e.target.value);}} />
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Good Weight</label>
                        {/* button here to read weight */}
                        { !reading ? <button type="button" className="text-lg text-blue-500 dark:text-blue-400 self-end mt-1" onClick={()=>{readWeightFilled()}}>Read</button> : <button type="button" className="text-sm text-red-500 dark:text-red-400 self-end mt-1" onClick={()=>{stopReadingFilled()}}>Stop</button>}
                    </div>
                    <div className="relative z-0 w-full mb-5 group flex flex-col"> {/* Change flex direction to column */}
                        <input type="number" name="empty_weight" id="floating_first_name" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="0" value={garbageWeight} onChange={(e)=>{setGarbageWeight(e.target.value);}} />
                        <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Garbage Weight</label>
                        {/* button here to read weight */}
                        { !reading ? <button type="button" className="text-lg text-blue-500 dark:text-blue-400 self-end mt-1" onClick={()=>{readWeightFilled()}}>Read</button> : <button type="button" className="text-sm text-red-500 dark:text-red-400 self-end mt-1" onClick={()=>{stopReadingFilled()}}>Stop</button>}
                    </div>
                    
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

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Work Amount:</h3>
                    <p className="text-5xl font-semibold text-gray-900 dark:text-white">{workAmountReading}</p>

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

export default AddContractorWork