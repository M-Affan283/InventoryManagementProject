import { useState, useEffect,useContext } from 'react'
import axios from 'axios';
import { UserContext } from '../ContextStore';
import { useNavigate } from 'react-router-dom';

const AddVendor = () => {

    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [serverResponse, setServerResponse] = useState<{message:string, status:number} | null>(null);

    const {user,apiUrl} = useContext(UserContext);

    const nav = useNavigate();

    const [vendorPoc, setVedorPoc] = useState<string>("");
    const [vendorName, setVendorName] = useState<string>("");
    const [vendorContact, setVendorContact] = useState<string>("");

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
        console.log(`Details: ${vendorName}, ${vendorContact}, ${vendorPoc}`)
        try
        {
            axios.post(`${apiUrl}/user/addVendor`, {vendor_name: vendorName, vendor_contact: vendorContact, vendor_poc: vendorPoc, created_by: user?.email})
            .then((res)=>
            {
                if(res.status === 200)
                {
                    console.log("Vendor created successfully");
                    setServerResponse({message: res.data.message, status: 200});
                    closeForm();
                }
                else
                {
                    console.log("Failed to create vendor: ", res.data.message);
                    setServerResponse({message: res.data.message, status: 400});
                    closeForm();
                }
            })
            .catch((err)=>
            {
                console.log("Failed to create vendor: ", err.response.data.message);
                setServerResponse({message: err.response.data.message, status: 400});
                closeForm();
            })

        }
        catch(error)
        {
            console.log("Failed to create vendor: ", error);
            setServerResponse({message: "Failed to create vendor", status: 400});
            closeForm();
        }

    }
    
        
        
    const openForm = () => setIsFormOpen(true);
    const closeForm = () => {setIsFormOpen(false);};


  return (
    <div>
    
            {/* CARD */}
            <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Vendor</h5>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Create a new vendor or list existing ones.</p>
                <div className="flex justify-between gap-4">
                    <button onClick={openForm} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        Create Vendor
                    </button>
                    <button onClick={()=>nav('/allvendors')} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        List Vendor
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
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Vendor</h2>
                        <br/>

                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="floating_first_name" id="floating_first_name" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setVendorName(e.target.value)} />
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Vendor Name</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="email" id="floating_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setVendorContact(e.target.value)} />
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Vendor Contact</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="password" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setVedorPoc(e.target.value)} />
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Vendor POC</label>
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

export default AddVendor