// import React from 'react'

//a small component for the sidebar

import {useRef,useEffect,useContext} from 'react'
import { UserContext } from './ContextStore';
import { useNavigate } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EngineeringIcon from '@mui/icons-material/Engineering';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const Sidebar = () => {

    const sidebarRef = useRef<HTMLDivElement>(null);
    const nav = useNavigate();

    const {user,setIsLogged,setUser} = useContext(UserContext);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
            const sidebar = document.getElementById('default-sidebar');
            sidebar?.classList.add('-translate-x-full');
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);

    

    const toggleSidebar = () => {
        const sidebar = document.getElementById('default-sidebar');
        sidebar?.classList.toggle('-translate-x-full');
    }

    const Logout = () =>
    {
        setUser(null);
        setIsLogged(false);
        localStorage.removeItem('user');
        localStorage.removeItem('isLogged');
        
        nav('/');
    }


  return (
    
    <aside ref={sidebarRef}>
      
        <button data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" onClick={toggleSidebar}>
            <span className="sr-only">Open sidebar</span>
            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
            </svg>
        </button>

        <aside id="default-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
            <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">

            <a className="flex items-center ps-2.5 mb-5">
                <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Weight Management</span>
            </a>

                <ul className="space-y-2 font-medium">
                    <li>
                        <a  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" onClick={()=>nav('/dashboard')}>
                        <DashboardIcon/>
                        <span className="ms-3">Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" onClick={()=>nav('/addforms')}>
                        <LocalShippingIcon/>
                        <span className="flex-1 ms-3 whitespace-nowrap">Add Truck</span>
                        </a>
                    </li>

                    <li>
                        <a  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" onClick={()=>nav('/allcontainers')}>
                        <ListAltIcon/>
                        <span className="flex-1 ms-3 whitespace-nowrap">List Trucks</span>
                        </a>
                    </li>

                    {user?.role === "admin" &&
                        <>
                        <li>
                            <a  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" onClick={()=>nav('/allemployees')}>
                            <EngineeringIcon/>
                            <span className="flex-1 ms-3 whitespace-nowrap">List Employees</span>
                            </a>
                        </li>
                        </>

                    }

                    <li>
                        <a  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" onClick={()=>nav('/notifications')}>
                        <NotificationsNoneIcon/>
                        <span className="flex-1 ms-3 whitespace-nowrap">Change Logs</span>
                        {/* <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">3</span> */}
                        </a>
                    </li>
                    <li>
                        <a  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" onClick={()=>nav(`/profile`)}>
                        <PersonOutlineIcon/>
                        <span className="flex-1 ms-3 whitespace-nowrap">Profile</span>
                        </a>
                    </li>
                    <li>
                        <a  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" onClick={()=>nav(`/settings`)}>
                        <SettingsIcon/>
                        <span className="flex-1 ms-3 whitespace-nowrap">Settings</span>
                        </a>
                    </li>

                    <li className="absolute bottom-4 left-0 w-full">
                        <a  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" onClick={Logout}>
                        <LogoutIcon/>
                        <span className="flex-1 ms-3 whitespace-nowrap">Logout</span>
                        </a>
                    </li>
                </ul>
            </div>
            </aside>
    </aside>



  )
}

export default Sidebar