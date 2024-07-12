import { useEffect, useState,useContext } from 'react'
import { useNavigate,useParams } from 'react-router-dom'
import CustomSidebar from './Sidebar'
import axios from 'axios'
import { UserContext } from './ContextStore'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';

const IndividualWeightTransaction = (props:any) => {

    const {transaction_id} = useParams();

    // console.log("Transaction ID: ", transaction_id)

    const [transaction, setTransaction] = useState<any>(null)
    const [updateBool, setUpdateBool] = useState<boolean>(false)
    const [adjustUpdateBool, setAdjustUpdateBool] = useState<boolean>(false) //weight adjustment form
    const [deleteTransaction, setDeleteTransaction] = useState<boolean>(false) //if delete container is clicked, container will be deleted
    const [reading, setReading] = useState<boolean>(false);
    const [serverResponse, setServerResponse] = useState<{message:string, status:number} | null>(null);

    const {user, isLogged, comPort, baudRate, apiUrl} = useContext(UserContext);
    const nav = useNavigate();

    const [type, setType] = useState<string>('');
    const [truckNo, setTruckNo] = useState<string>('');
    const [driverName, setDriverName] = useState<string>('');
    const [driverContact, setDriverContact] = useState<string>('');
    // const [goodsType, setGoodsType] = useState<string>('');
    const [emptyWeight, setemptyWeight] = useState<string>('');
    const [filledWeight, setfilledWeight] = useState<string>('');
    const [goodsWeight, setGoodsWeight] = useState<string>('');
    const [weightAdjust, setWeightAdjust] = useState<string>('');
    const [goodsTypeDropdownValue, setGoodsTypeDropdownValue] = useState<string>();
    const [emptyContainer, setEmptyContainer] = useState<boolean>(false);
    const [weightReading, setWeightReading] = useState<string>("0");
    const [deleteReason, setDeleteReason] = useState<string>('');

    const closeForm = () => {setUpdateBool(false); setDeleteTransaction(false); setAdjustUpdateBool(false);}
    // const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    // const toggleGoodsTypeDropdown = () => setGoodsTypeDropdownOpen(!goodsTypeDropdownOpen);
    const isEmptyContainer = () => setEmptyContainer(!emptyContainer);

    useEffect(() => 
    {
    
        if(!isLogged)
        {
            nav("/");
        }
    
        try
        {
    
            axios.get(`${apiUrl}/goods/getIndividualWeighingTransaction`, {params: {transaction_id: transaction_id}})
            .then((res)=>
            {

                if(res.status === 200)
                {
                    console.log("Transaction details: ", res.data.transaction);

                    setTransaction(res.data.transaction);

                    if(res.data.transaction.goods_weight === 0)
                    {
                        setEmptyContainer(true);
                    }
            

                    setType(res.data.transaction.type);
                    setTruckNo(res.data.transaction.truck_no);
                    setDriverName(res.data.transaction.driver_name);
                    setDriverContact(res.data.transaction.driver_contact);
                    setemptyWeight(res.data.transaction.empty_weight.toFixed(2));
                    setfilledWeight(res.data.transaction.filled_weight.toFixed(2));
                    setGoodsWeight(res.data.transaction.goods_weight.toFixed(2));
                    setWeightAdjust(res.data.transaction.weight_adjust.toFixed(2));
                    setGoodsTypeDropdownValue(res.data.transaction.goods_type_id.good_name);
                }
                else
                {
                    console.log("Failed to fetch transactions details: ", res.data);
                }

            })
            .catch((err)=>
            {
                console.log("Failed to fetch transactions details: ", err);
            })
        }
        catch(error)
        {
            console.log("Failed to fetch transactions details: ", error);
        }
    },[])
    const readWeightEmpty = () =>
    {
        console.log("Reading weight from serial port...");
        stopReadingEmpty(); 
        setReading(true);


        //start data reading
        window.api.getWeightDataEmpty(comPort || 'COM5', baudRate || 1200);

        //receive data
        let unsub = window.api.receiveEmpty('weight-data-base', (_event:any, data:any)=>
        {
            console.log("Data received: ", data);
            setemptyWeight(data);
            setWeightReading(data);
        })

        return () => unsub();
    }

    const readWeightFilled = () =>
    {
        console.log("Reading weight from serial port...");
        stopReadingFilled(); 
        setReading(true);


        //start data reading
        window.api.getWeightDataFilled(comPort || 'COM5', baudRate || 1200);

        //receive data
        let unsub = window.api.receiveFilled('weight-data-final', (_event:any, data:any)=>
        {
            // console.log("Data received: ", data);
            setfilledWeight(data);
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

    const calculateGoodsWeight = () => 
    {
        const goodsWeight = parseFloat(filledWeight || '0') - parseFloat(emptyWeight || '0');
        setGoodsWeight(goodsWeight.toString());
    }

    useEffect(()=>
    {
        calculateGoodsWeight();
    },[emptyWeight, filledWeight])

    useEffect(()=>
    {
        const timer = setTimeout(()=>
        {
            setServerResponse(null);
        }, 5000)
    
        return () => clearTimeout(timer);
    }, [serverResponse])



    const updateContainer = (e:any) =>
    {
        e.preventDefault();
        console.log("Sending container info to server...")
    
        try
        {
            axios.post('http://localhost:5000/goods/updateWeighingTransaction', {
                transaction_id: transaction_id,
                empty_weight: emptyWeight,
                filled_weight: filledWeight,
                goods_weight: goodsWeight,
                // employee: user?.email
            })
            .then((res)=>
            {
                if(res.status === 200)
                {
                    console.log("Transaction updated successfully");
                    setServerResponse({message: "Transaction updated successfully", status: 200});
                    closeForm();
                    //wait 2.5 seconds then redirect listtransactions
                    setTimeout(()=>nav("/listtransactions"), 2500);
                }
                else
                {
                    console.log("Failed to update container: ", res.data.message);
                    setServerResponse({message: "Failed to update Transaction", status: 400});
                    closeForm();
                }
            })
            .catch((err)=>
            {
                console.log("Failed to update Transaction: ", err.response.data.message);
                setServerResponse({message: "Failed to update Transaction", status: 400});
                closeForm();
            })
    
        }
        catch(error)
        {
            console.log("Failed to update Transaction: ", error);
            setServerResponse({message: "Failed to update Transaction", status: 400});
            closeForm();
        }
    }

    const handleWeightAdjust = (e:any) =>
    {
        e.preventDefault();
        console.log("Sending weight adjust info to server...")

        try
        {
            axios.post(`${apiUrl}/goods/addWeightAdjustment`, {transaction_id: transaction_id, weight_adjust: weightAdjust, employee: user?.email})
            .then((res)=>
            {
                if(res.status === 200)
                {
                    console.log("Weight adjustment added successfully");
                    setServerResponse({message: "Weight adjustment added successfully", status: 200});
                    closeForm();
                }
                else
                {
                    console.log("Failed to add weight adjustment: ", res.data.message);
                    setServerResponse({message: "Failed to add weight adjustment", status: 400});
                    closeForm();
                }
            
            })

        }
        catch(error)
        {
            console.log("Failed to update Transaction: ", error);
            setServerResponse({message: "Failed to update Transaction", status: 400});
            closeForm();
        }
    }



    const deleteSubmit = (e:any) =>
    {
        e.preventDefault();
        console.log("Deleting container...")
    
        try
        {
            axios.delete("http://localhost:5000/goods/deleteWeighingTransaction", {params: {transaction_id: transaction_id, delete_reason: deleteReason, employee: user?.email}})
            .then((res)=>
            {
                if(res.status === 200)
                {
                    console.log("Transaction deleted successfully");
                    setServerResponse({message: "Transaction deleted successfully", status: 200});
                    // closeForm();
                    nav("/listtransactions");
                }
                else
                {
                    console.log("Failed to delete Transaction: ", res.data.message);
                    setServerResponse({message: "Failed to delete Transaction", status: 400});
                // closeForm();
                }
        
            })
        }
        catch(error)
        {
            console.log("Failed to delete Transaction: ", error);
            setServerResponse({message: "Failed to delete Transaction", status: 400});
        }
    }


  return (
    

    <div className='flex flex-row w-full overflow-hidden dark:bg-gray-800 dark:text-white'>
     <CustomSidebar />
     <div className="p-4 sm:ml-64 bg-gray-100 dark:bg-gray-900 font-mono flex-grow">
       <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
         <br/>

         <button type="button" className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 gap-3" onClick={()=>nav('/listtransactions')}>
            <ArrowBackIcon/>
            Back
        </button>

        {transaction ? 
            <section className="bg-white dark:bg-gray-900">
            <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
                <h2 className="mb-2 text-xl font-semibold leading-none text-gray-900 md:text-2xl dark:text-white">Transaction {transaction.serial_no}</h2>
                <br/>
  
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
  
                <br/>
                <br/>
  
                <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 text-lg">
                  <div>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Type:</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{transaction.type}</dd>
                  </div>
                  <div>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Truck No:</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{transaction.truck_no}</dd>
                  </div>
                  <div>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Driver Name:</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{transaction.driver_name}</dd>
                  </div>
                  <div>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Driver Contact:</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{transaction.driver_contact}</dd>
                  </div>
                  <div>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Goods Type:</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{transaction.goods_type_id.good_name}</dd>
                  </div>
                  <div>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Empty Weight:</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{parseFloat(transaction.empty_weight).toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Filled Weight:</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{parseFloat(transaction.filled_weight).toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Goods Weight:</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{(parseFloat(transaction.goods_weight)-parseFloat(transaction.weight_adjust)).toFixed(2)}</dd>
                  </div>
                  {transaction.type === "incoming" &&
                  
                  <div>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Weight Adjust (Khatam):</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{parseFloat(transaction.weight_adjust).toFixed(2)}</dd>
                  </div>
                  
                  }
                  <div>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Date Empty Weight Recorded:</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400"> {new Date(transaction.date_empty_weight).toLocaleString()}</dd>
                  </div>
                  
                  { transaction.date_filled_weight &&

                    <div>
                        <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Date Filled Weight Recorded:</dt>
                        <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400"> {new Date(transaction.date_filled_weight).toLocaleString()}</dd>
                    </div>

                  }
  
                  {transaction.is_deleted && (
                      <>
                          <div>
                              <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Date Deleted:</dt>
                              <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400"> {new Date(transaction.date_deleted).toLocaleString()}</dd>
                          </div>
                          <div>
                              <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Delete Reason:</dt>
                              <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400"> {transaction.delete_reason}</dd>
                          </div>
                      </>
                  )}
                
                </dl>
                <div className="flex items-center space-x-4">
                    <button type="button" className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={()=>setUpdateBool(!updateBool)}>
                        <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>
                        Edit
                    </button>
                    {transaction.type === "incoming" &&
                    
                    <button type="button" className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={()=>setAdjustUpdateBool(!adjustUpdateBool)}>
                        <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>
                        Weight Adjustment (Khatam)
                    </button>
                    
                    }
                    <button type="button" className="inline-flex items-center text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900" onClick={()=>setDeleteTransaction(!deleteTransaction)}>
                        <svg aria-hidden="true" className="w-5 h-5 mr-1.5 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                        Delete
                    </button> 
                </div>
            </div>
          </section> 
        
            :

        <div className="flex justify-center items-center h-96">
            <CircularProgress />
        </div>
        
        }


        {updateBool && props.desktopApp &&
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
                <div className="max-h-[80vh] overflow-y-auto w-full max-w-md">

                <form className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full transition-transform duration-300 transform scale-95" onSubmit={updateContainer}>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Update Transaction</h2>
                    <br/>
                    <br/>
                    <br/>
                    <div className="relative z-0 w-full mb-5 group">
                        <input disabled type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={truckNo} required onChange={(e)=>setTruckNo(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Truck No.</label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input disabled type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={driverName} required onChange={(e)=>setDriverName(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Driver Name</label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input disabled type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={driverContact} required onChange={(e)=>setDriverContact(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Driver Contact</label>
                    </div>
                    <div className="relative z-100 w-full mb-5 group">
                            
                            <button disabled id="dropdownDefaultButton" data-dropdown-toggle="dropdown" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">{goodsTypeDropdownValue}<svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                            </svg>
                            </button>
                      </div>

                    
                    <div className="relative z-0 w-full mb-5 group">
                        <input disabled type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={weightAdjust} required onChange={(e)=>setWeightAdjust(e.target.value)} />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Weight Adjust</label>
                    </div>

                    <div className="flex items-start mb-5">
                        <div className="flex items-center h-5">
                            <input disabled id="terms" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" checked={emptyContainer} onChange={isEmptyContainer} />
                        </div>
                            <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"> Empty Container </label>
                    </div>

                    <div className="grid md:grid-cols-2 md:gap-6">
                        <div className="relative z-0 w-full mb-5 group flex flex-col">
                            <input type="number" name="empty_weight" id="floating_first_name" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="0" value={emptyWeight} required onChange={(e)=>{setemptyWeight(e.target.value);}} />
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Empty Weight</label>
                            
                            { !reading ? <button type="button" className="text-sm text-blue-500 dark:text-blue-400 self-end mt-1" onClick={()=>{readWeightEmpty()}}>Read</button> : <button type="button" className="text-sm text-red-500 dark:text-red-400 self-end mt-1" onClick={()=>{stopReadingEmpty()}}>Stop</button>}
                        </div>
                        <div className="relative z-0 w-full mb-5 group flex flex-col">
                            
                            <input type="number" name="empty_weight" id="floating_first_name" className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer ${emptyContainer ? 'bg-gray-100 opacity-50 pointer-events-none' : ''}`} placeholder="0" value={filledWeight} required={!emptyContainer} onChange={(e)=>{setfilledWeight(e.target.value);}} />
                            <label className={`peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${emptyContainer ? 'opacity-50 pointer-events-none' : ''}`}>Filled Weight</label>
                            
                            { !reading ? <button type="button" className={`text-sm text-blue-500 dark:text-blue-400 self-end mt-1 ${emptyContainer ? 'opacity-50 pointer-events-none' : ''}`} disabled={emptyContainer} onClick={()=>readWeightFilled()}>Read</button> : <button type="button" className={`text-sm text-red-500 dark:text-red-400 self-end mt-1 ${emptyContainer ? 'opacity-50 pointer-events-none' : ''}`} disabled={emptyContainer} onClick={()=>stopReadingFilled()}>Stop</button>}
                        </div>
                    </div>
                    
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="number" name="goods_weight" value={goodsWeight} id="floating_phone" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required readOnly/>
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Goods Weight</label>
                    </div>
                   
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={closeForm} className="text-red-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Cancel</button>
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                    </div>

                </form>

            </div>
            
            <div className="flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg h-1/2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Weight Reading:</h3>
                <p className="text-4xl font-semibold text-gray-900 dark:text-white">{weightReading}</p>
            </div>
        </div>
        
        
        }

        {updateBool && !props.desktopApp && (
            <div className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 w-full" role="alert">
                <span className="font-medium">Please use the desktop app to fill in this form.</span>
                <button type="button" onClick={closeForm} className="text-red-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Ok</button>
            </div>
        )}

        { adjustUpdateBool &&
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
                <div className="max-h-[80vh] overflow-y-auto w-full max-w-md">
                    <form className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full transition-transform duration-300 transform scale-95" onSubmit={handleWeightAdjust}>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Update Weight Adjust (Khatam)</h2>
                        <br/>
                        <br/>
                        <br/>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={weightAdjust} required onChange={(e)=>setWeightAdjust(e.target.value)} />
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Weight Adjusut.</label>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button type="button" onClick={closeForm} className="text-red-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Cancel</button>
                            <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                        </div>

                    </form>
                </div>
            </div>
        }


        { deleteTransaction && 

        <div id="popup-modal" className="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 bottom-0 z-50 justify-center items-center w-full md:inset-0 h-full">
          
          <form onSubmit={deleteSubmit}>
            
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-900">
                    <button type="button" className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal" onClick={()=>setDeleteTransaction(!deleteTransaction)}>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                        </svg>
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this product?</h3>
                        <input type="text" name="goods_weight" id="floating_phone" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="Delete Reason " required onChange={(e:any)=>setDeleteReason(e.target.value)} />
                        <br/>
                        <button data-modal-hide="popup-modal" type="submit" className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                            Yes, I'm sure
                        </button>
                        <button data-modal-hide="popup-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" onClick={()=>setDeleteTransaction(!deleteTransaction)}>No, cancel</button>
                    </div>
                </div>
            </div>
          </form>
          
        </div>
        }


       </div>
     </div>
   </div>



  )
}

export default IndividualWeightTransaction