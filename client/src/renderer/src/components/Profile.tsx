import {useEffect, useContext} from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { UserContext } from './ContextStore'

const Profile = () => {

  const {user, isLogged} = useContext(UserContext);
  const nav = useNavigate();

  useEffect(()=>
  {
    if(!isLogged)
    {
      nav('/');
    }
  },[])


  return (


    <div className='flex flex-row w-full overflow-hidden dark:bg-gray-800 dark:text-white'>
     <Sidebar />
     <div className="p-4 sm:ml-64 bg-gray-100 dark:bg-gray-900 font-mono flex-grow">
       <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
         <br/>

         <section className="bg-white dark:bg-gray-900">
          <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
              <h2 className="mb-2 text-xl font-semibold leading-none text-gray-900 md:text-2xl dark:text-white">User {user?.id}</h2>
              <br/>

              <br/>
              <br/>

              <dl className="text-lg">
                <div>
                  <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">First Name:</dt>
                  <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{user?.firstName}</dd>
                </div>
                <div>
                  <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Last Name:</dt>
                  <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{user?.lastName}</dd>
                </div>
                <div>
                  <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Email:</dt>
                  <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{user?.email}</dd>
                </div>
                <div>
                  <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Role:</dt>
                  <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{user?.role}</dd>
                </div>
              </dl>
          </div>
        </section>
      </div>
    </div>
  </div>


      
  )
}

export default Profile