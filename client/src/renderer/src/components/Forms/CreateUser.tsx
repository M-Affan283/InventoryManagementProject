import { useState, useEffect,useContext } from 'react'
import axios from 'axios';
import { UserContext } from '../ContextStore';
import { useNavigate } from 'react-router-dom';

const CreateUser = () => {

    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [dropDownValue, setDropDownValue] = useState<string>("Role");
    const [serverResponse, setServerResponse] = useState<{message:string, status:number} | null>(null);

    const {user,apiUrl} = useContext(UserContext);

    const nav = useNavigate();

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    useEffect(()=>
    {
        const timer = setTimeout(()=>
        {
            setServerResponse(null);
        }, 5000)

        return () => clearTimeout(timer);
    }, [serverResponse])
    
        
        
    const openForm = () => setIsFormOpen(true);
    const closeForm = () => {setIsFormOpen(false);};

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleDropdownChange = (value:string) =>
    {
        setDropDownValue(value);
        setDropdownOpen(false);
    };

    const formSubmit = (e:any) =>
    {
        e.preventDefault();
        console.log(firstName, lastName, email, password, dropDownValue);

        if(password !== confirmPassword)
        {
            setServerResponse({message: "Passwords do not match", status: 400});
            closeForm();
            return;
        }

        try
        {
            axios.post(`${apiUrl}/user/createUser`, {firstName: firstName, lastName: lastName, email: email, password: password, role: dropDownValue, creator_email: user?.email})
            .then((res)=>
            {
                if(res.status === 200)
                {
                    console.log("User created successfully");
                    setServerResponse({message: res.data.message, status: 200});
                    closeForm();
                }
                else
                {
                    console.log("Failed to create user: ", res.data.message);
                    setServerResponse({message: res.data.message, status: 400});
                    closeForm();
                }
            })
            .catch((err)=>
            {
                console.log("Failed to create user: ", err.response.data.message);
                setServerResponse({message: err.response.data.message, status: 400});
                closeForm();
            })

        }
        catch(error)
        {
            console.log("Failed to create user: ", error);
            setServerResponse({message: "Failed to create user", status: 400});
            closeForm();
        }

    }

    return (

        <div>
    
            {/* CARD */}
            <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">User</h5>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Create a new user or list existing users.</p>
                {/* two buttons in a row on to create one to list */}
                <div className="flex justify-between gap-4">
                    <button onClick={openForm} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        Create User
                    </button>
                    <button onClick={()=>nav('/allemployees')} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        List Users
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
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create User</h2>
                        <br/>
                        <div className="relative z-50 w-full mb-5 group flex justify-center">
                            <button id="dropdownDefaultButton" onClick={toggleDropdown} data-dropdown-toggle="dropdown" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">{dropDownValue}<svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                            </svg>
                            </button>
    
                            {/* <!-- Dropdown menu --> */}
                            <div id="dropdown" className={`${dropdownOpen ? 'block' : 'hidden'} z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 absolute top-full mt-1`}>
                                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                                <li>
                                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={()=>handleDropdownChange('admin')}>Admin</a>
                                </li>
                                <li>
                                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={()=>handleDropdownChange('employee')}>Employee</a>
                                </li>
                                </ul>
                            </div>
    
                        </div>
                        <div className="grid md:grid-cols-2 md:gap-6">
                            <div className="relative z-0 w-full mb-5 group">
                                <input type="text" name="floating_first_name" id="floating_first_name" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setFirstName(e.target.value)} />
                                <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">First name</label>
                            </div>
                            <div className="relative z-0 w-full mb-5 group">
                                <input type="text" name="floating_last_name" id="floating_last_name" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setLastName(e.target.value)} />
                                <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Last name</label>
                            </div>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="email" name="email" id="floating_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setEmail(e.target.value)} />
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="password" name="password" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setPassword(e.target.value)} />
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>
                        </div>
                        {/* <div className="grid md:grid-cols-2 md:gap-6"> */}
                        <div className="relative z-0 w-full mb-5 group flex flex-col"> {/* Change flex direction to column */}
                            <input type="password" name="co" id="confirm_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required onChange={(e)=>setConfirmPassword(e.target.value)} />
                            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirm Password</label>
                        {/* </div> */}
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
    );
}

export default CreateUser