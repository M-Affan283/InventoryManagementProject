import { useEffect, useState,useContext } from 'react'
import { useNavigate,useParams } from 'react-router-dom'
import CustomSidebar from './Sidebar'
import axios from 'axios'
import { UserContext } from './ContextStore'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import { DocumentScanner } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const IndividualInternalTransaction = (props:any) => {

    const {transaction_id} = useParams();

    const [transaction, setTransaction] = useState<any>(null)
    const [updateBool, setUpdateBool] = useState<boolean>(false)
    const [deleteTransaction, setDeleteTransaction] = useState<boolean>(false) //if delete container is clicked, container will be deleted
    const [reading, setReading] = useState<boolean>(false);
    const [serverResponse, setServerResponse] = useState<{message:string, status:number} | null>(null);

    const {user, isLogged, comPort, baudRate, apiUrl} = useContext(UserContext);
    const nav = useNavigate();

    const [emptyWeight, setemptyWeight] = useState<string>('');
    const [filledWeight, setfilledWeight] = useState<string>('');
    const [goodsWeight, setGoodsWeight] = useState<string>('');
    const [goodsTypeDropdownValue, setGoodsTypeDropdownValue] = useState<string>();
    const [emptyContainer, setEmptyContainer] = useState<boolean>(false);
    const [weightReading, setWeightReading] = useState<string>("0");
    const [deleteReason, setDeleteReason] = useState<string>('');
    const [goodsRate, setGoodsRate] = useState<string>('');
    const [contractorCode, setContractorCode] = useState<string>('');
    const [contractorName, setContractorName] = useState<string>('');

    const closeForm = () => {setUpdateBool(false); setDeleteTransaction(false)};

    useEffect(()=>
    {
        if(!isLogged)
        {
            nav('/');
        }


        try
        {
            axios.get(`${apiUrl}/goods/getIndividualContractorWork`, {params: {work_id: transaction_id}})
            .then((res)=>
            {

                if(res.status === 200)
                {
                    console.log("Transactions details fetched successfully: ", res.data.transaction);

                    setTransaction(res.data.transaction);

                    setGoodsRate(res.data.transaction.goods_rate);
                    setGoodsWeight(res.data.transaction.goods_weight.toFixed(2));
                    setGoodsTypeDropdownValue(res.data.transaction.goods_type_id.good_name);
                    setContractorCode(res.data.transaction.contractor_id.contractor_code);
                    setContractorName(res.data.transaction.contractor_id.contractor_name);
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

    useEffect(()=>
    {
        const timer = setTimeout(()=>
        {
            setServerResponse(null);
        }, 5000)

        return () => clearTimeout(timer);
    }, [serverResponse])

    useEffect(()=>
    {
        console.log(transaction)
    },[transaction])

    const deleteSubmit = (e:any) =>
    {
        e.preventDefault();
        console.log("Deleting container...")
    
        try
        {
        axios.delete("http://localhost:5000/goods/deleteContractorWork", {params: {work_id: transaction_id, delete_reason: deleteReason, employee: user?.email}})
        .then((res)=>
        {
            if(res.status === 200)
            {
                console.log("Transaction deleted successfully");
                setServerResponse({message: "Transaction deleted successfully", status: 200});
                closeForm();
                // setDeleteTransaction(false);
                setTimeout(() => {
                    nav("/listintrecords"); 
                }, 2500);

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
            setGoodsWeight(data);
            setWeightReading(data);
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

    const updateTransaction = (e:any) =>
    {
        e.preventDefault();
        console.log("Updating transaction...");

        try
        {
            axios.post(`${apiUrl}/goods/updateContractorWork`, {work_id: transaction_id, goods_weight: goodsWeight, employee: user?.email})
            .then((res)=>
            {
                if(res.status === 200)
                {
                    console.log("Transaction updated successfully");
                    setServerResponse({message: "Transaction updated successfully", status: 200});
                    closeForm();
                    //wait 2.5 seconds before redirecting to list
                    setTimeout(()=>{nav('/listintrecords')}, 2500);
                }
                else
                {
                    console.log("Failed to update transaction: ", res.data.message);
                    setServerResponse({message: "Failed to update transaction", status: 400});
                    closeForm();
                }
            
            })
            .catch((err)=>
            {
                console.log("Failed to update transaction: ", err);
                setServerResponse({message: "Failed to update transaction", status: 400});
                closeForm();
            })

        }
        catch(error)
        {
            console.log("Failed to update transaction: ", error);
            setServerResponse({message: "Failed to update transaction", status: 400});
        }
    }


  return (
    <div className='flex flex-row w-full overflow-hidden dark:bg-gray-800 dark:text-white'>
     <CustomSidebar />
     <div className="p-4 sm:ml-64 bg-gray-100 dark:bg-gray-900 font-mono flex-grow">
       <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
         <br/>

         <button type="button" className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 gap-3" onClick={()=>nav('/listintrecords')}>
            <ArrowBackIcon/>
            Back
        </button>

         {transaction ? 
         
         <section className="bg-white dark:bg-gray-900">
         <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
             <h2 className="mb-2 text-xl font-semibold leading-none text-gray-900 md:text-2xl dark:text-white">Transaction {transaction._id}</h2>
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
                 <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Contractor Name:</dt>
                 <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{transaction.contractor_id.contractor_name}</dd>
               </div>
               <div>
                 <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Contractor Code:</dt>
                 <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{transaction.contractor_id.contractor_code}</dd>
               </div>
               <div>
                 <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Contractor Contact:</dt>
                 <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{transaction.contractor_id.contractor_contact}</dd>
               </div>
               <div>
                 <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Goods Type:</dt>
                 <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{transaction.goods_type_id.good_name}</dd>
               </div>
               <div>
                 <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Goods Weight:</dt>
                 <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{(parseFloat(transaction.goods_weight)).toFixed(2)}</dd>
               </div>
               <div>
                 <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Work Amount:</dt>
                 <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{(parseFloat(transaction.work_amount)).toFixed(2)}</dd>
               </div>
               <div>
                 <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Date Created:</dt>
                 <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400"> {new Date(transaction.date_created).toLocaleString()}</dd>
               </div>
               {transaction.date_updated && (
                   <div>
                   <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Date Updated:</dt>
                   <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400"> {new Date(transaction.date_updated).toLocaleString()}</dd>
                   </div>
               )}

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
                    <EditIcon/>
                    Edit
                 </button>
                 <button type="button" className="inline-flex items-center text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={()=>nav(`/genintpdf/${transaction_id}`)}>
                        <DocumentScanner/>
                        Generate PDF
                </button> 
                 <button type="button" className="inline-flex items-center text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900" onClick={()=>setDeleteTransaction(!deleteTransaction)}>
                    <DeleteForeverIcon/>
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

        {/* open update form */}
        {updateBool &&
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
                <div className="max-h-[80vh] overflow-y-auto w-full max-w-md">
            {/* make this for wider */}
                    <form className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full dark:text-white" onSubmit={updateTransaction}>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Update Transaction</h2>
                            <br/>
                            <br/>
                            <br/>
                        {/* <div className="relative z-0 w-full mb-5 group">
                            <input disabled type="text" name="truck_no" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value={contractorCode} required onChange={(e)=>setContractorCode(e.target.value)} />
                            <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Contractor Code </label>
                        </div>
                        <div className="relative z-100 w-full mb-5 group">
                            <button id="dropdownDefaultButton" disabled data-dropdown-toggle="dropdown" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">{goodsTypeDropdownValue}<svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                            </svg>
                            </button>
                        </div> */}

                        
                        <div className="relative z-0 w-full mb-5 group flex flex-col"> {/* Change flex direction to column */}
                            <input type="number" name="empty_weight" id="floating_first_name" className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="0" value={goodsWeight} required onChange={(e)=>{setGoodsWeight(e.target.value);}} />
                            <label className="peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Goods Weight</label>
                            {/* button here to read weight */}
                            { !reading ? <button type="button" className="text-lg text-blue-500 dark:text-blue-400 self-end mt-1" onClick={()=>{readWeightFilled()}}>Read</button> : <button type="button" className="text-sm text-red-500 dark:text-red-400 self-end mt-1" onClick={()=>{stopReadingFilled()}}>Stop</button>}
                        </div>
                        
                        {/* submit and cancel button should show side by side */}
                        <div className="flex justify-end space-x-4">
                            <button type="button" onClick={closeForm} className="text-red-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-lg px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Cancel</button>
                            <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                        </div>

                    </form>

                </div>
                <div className="flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Weight Reading:</h3>
                    <p className="text-5xl font-semibold text-gray-900 dark:text-white">{weightReading}</p>
                </div>
        </div>
        
        
        }

        {updateBool && !props.desktopApp && (
            <div className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 w-full" role="alert">
                <span className="font-medium">Please use the desktop app to fill in this form.</span>
                <button type="button" onClick={closeForm} className="text-red-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Ok</button>
            </div>
        )}


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

export default IndividualInternalTransaction