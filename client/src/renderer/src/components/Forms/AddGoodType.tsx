import {useState, useEffect, useContext} from 'react'
import axios from 'axios'
import { UserContext } from '../ContextStore';

const AddGoodType = () => {

    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [goodType, setGoodType] = useState<string>('')
    const [serverResponse, setServerResponse] = useState<{message:string, status:number} | null>(null);

    const {setGoodsType,apiUrl} = useContext(UserContext);

    const openForm = () => setIsFormOpen(true);
    const closeForm = () => {setIsFormOpen(false);};

    useEffect(()=>
    {
        const timer = setTimeout(()=>
        {
            setServerResponse(null);
        }, 5000)

        return () => clearTimeout(timer);
    }, [serverResponse])

    const formSubmit = (e:any) =>
    {
        e.preventDefault();
        console.log("Sending to server: ", goodType);

        try
        {
            axios.post(`${apiUrl}/goods/addType`, {name: goodType})
            .then((res)=>
            {
                if(res.status === 200)
                {
                    console.log("New Good Type created successfully");
                    setServerResponse({message: res.data.message, status: 200});
                    closeForm();
                    
                    //get goods type again and store in context
                    axios.get(`${apiUrl}/goods/getAllTypes`)
                    .then((res)=>
                    {
                        if(res.status === 200)
                        {
                            setGoodsType(res.data.types);
                            console.log("Goods Type: ", res.data.types);
                        }
                    })
                    .catch((err)=>
                    {
                        console.log("Error getting goods type: ", err);
                    })

                }
            })
            .catch((err)=>
            {
                console.log("Error creating new good type: ", err);
                setServerResponse({message: err.response.data.message, status: err.response.status});
            })
        }
        catch(error)
        {
            console.log("Error creating new good type: ", error);
            setServerResponse({message: "Internal Server Error", status: 500})
        }


    }


  return (
    <div>
    
            {/* CARD */}
            <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Add Goods Type</h5>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Create a new goods type and store it in the database.</p>
                <button onClick={openForm} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    Open Form
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                </button>
    
                <br/>
    
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
    
            {/* FORM OVERLAY */}
            {isFormOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
                    
                    <form className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full transition-transform duration-300 transform scale-95" onSubmit={formSubmit}>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Goods Type</h2>
                        <br/>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="text" id="text" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setGoodType(e.target.value)}/>
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Goods Type</label>
                        </div>
                        {/* submit and cancel button should show side by side */}
                        <div className="flex justify-end space-x-4">
                            <button type="button" onClick={closeForm} className="text-red-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Cancel</button>
                            <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                        </div>
                    </form>
                </div>
            )}
    
    
        </div>
  )
}

export default AddGoodType