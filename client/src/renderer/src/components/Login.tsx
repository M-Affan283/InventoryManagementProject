import {useState,useContext} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { UserContext } from './ContextStore';
// import bcrypt from 'bcryptjs'

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [serverResponse, setServerResponse] = useState(''); //for testing purposes only
    const nav = useNavigate();

    //set context here
    const {setUser, setIsLogged, setGoodsType, apiUrl} = useContext(UserContext);

    const loginSubmit = async (e: any) => 
    {
        e.preventDefault();
        console.log("Login request sent for: ", email);


        try
        {
            axios.post(`${apiUrl}/user/login`, {email: email, password: password})
            .then((res)=>
            {
                if(res.status === 200)
                {
                    console.log("Login successful");
                    setServerResponse(res.data.message);

                    //set context here and navigate to dashboard
                    setUser({id: res.data.user._id, firstName: res.data.user.firstName, lastName: res.data.user.lastName, email: res.data.user.email, role: res.data.user.role});
                    setIsLogged(true);
                    setGoodsType(res.data.goods_types);
                    // localStorage.setItem('user', JSON.stringify({id: res.data.user.id, firstName: res.data.user.firstName, lastName: res.data.user.lastName, email: res.data.user.email, role: res.data.user.role}));
                    // localStorage.setItem('isLogged', JSON.stringify(true));

                    res.data.user.role === "admin" ? nav("/dashboard") : nav("/profile");
                    // nav("/notifications")

                }
                else
                {
                    console.log("Login failed");
                    setServerResponse(res.data.message);
                }
            })
            .catch((err)=>
            {
                console.log("Login request failed: ", err.response.data.message);
                setServerResponse(err.response.data.message);
            })
        }
        catch(error)
        {
            console.log("Login request failed: ", error);
            setServerResponse("An error occurred")
        }
    }

  return (
    // move entire thing in the middle of the screen
    <div>
        <section className="bg-gray-50 dark:bg-gray-900" onSubmit={loginSubmit}>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    Inventory Management
                </a>

                {serverResponse &&
                
                    <div id="alert-2" className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                        <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                        </svg>
                        <span className="sr-only">Info</span>
                        <div className="ms-3 text-sm font-medium">
                            {serverResponse}
                        </div>
                        <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700" data-dismiss-target="#alert-2" aria-label="Close" onClick={setServerResponse.bind(this, '')}>
                            <span className="sr-only">Close</span>
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </button>
                    </div>

                }
            
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Sign in to your account
                        </h1>
                        <form className="space-y-4 md:space-y-6" action="#">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                                <input type="email" name="email" id="email" onChange={(e) => setEmail(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required/>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                <input type="password" name="password" id="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                            </div>
                            <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in</button>
                            
                        </form>
                    </div>
                </div>
            </div>
        </section>

        

    </div>
  )
}

export default Login