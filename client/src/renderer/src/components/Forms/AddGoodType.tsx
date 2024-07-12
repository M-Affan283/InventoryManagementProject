import {useState, useEffect, useContext} from 'react'
import axios from 'axios'
import { UserContext } from '../ContextStore';
import { useNavigate } from 'react-router-dom';

const AddGoodType = () => {

    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

    const [goodsCode, setGoodsCode] = useState<string>('')
    const [goodsName, setGoodsName] = useState<string>('')
    const [goodWeight, setGoodWeight] = useState<string>('0')
    const [goodRate, setGoodRate] = useState<string>('')

    const [serverResponse, setServerResponse] = useState<{message:string, status:number} | null>(null);

    const {user, setGoodsType, apiUrl} = useContext(UserContext);

    const nav = useNavigate();

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
        console.log(`Form submitted: ${goodsCode}, ${goodsName}, ${goodWeight}, ${goodRate}, ${user?.email}`);

        try
        {
            axios.post(`${apiUrl}/goods/addGoodsType`, {good_code: goodsCode, good_name: goodsName, good_weight: goodWeight, good_rate: goodRate, employee: user?.email})
            .then((res)=>
            {
                if(res.status === 200)
                {
                    console.log("New Good Type created successfully");
                    setServerResponse({message: res.data.message, status: 200});
                    closeForm();
                    
                    //get goods type again and store in context
                    axios.get(`${apiUrl}/goods/getGoodsTypes`)
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
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Goods Type</h5>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Create a new goods type or list available ones.</p>
                <div className="flex justify-between gap-4">
                    <button onClick={openForm} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        Create Good Type
                    </button>
                    <button onClick={()=>nav('/allgoodtypes')} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        List Good Types
                    </button>
                </div>
    
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
                            <input type="text" name="text" id="text" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setGoodsCode(e.target.value)}/>
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Good Code</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="text" id="text" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setGoodsName(e.target.value)}/>
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Good Name</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="text" id="text" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setGoodWeight(e.target.value)}/>
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Good Weight</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="text" id="text" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setGoodRate(e.target.value)}/>
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Good Rate</label>
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