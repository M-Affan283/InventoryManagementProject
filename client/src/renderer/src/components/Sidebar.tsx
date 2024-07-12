// import React from 'react'

//a small component for the sidebar

import {useRef,useEffect,useContext} from 'react'
import { UserContext } from './ContextStore';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Sidebar } from "flowbite-react";
import { FaWeightScale, FaDownLeftAndUpRightToCenter, FaUpRightAndDownLeftFromCenter } from "react-icons/fa6";
import { MdOutlineSettings, MdOutlineLogout } from "react-icons/md";



const CustomSidebar = () => {

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
            <Sidebar aria-label="Sidebar with multi-level dropdown example">

                <a className="flex items-center ps-2.5 mb-5 select-none">
                    <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Weight Management</span>
                </a>
                <br/>
                    <Sidebar.Items>
                        <Sidebar.ItemGroup>
                        {
                            user?.role === 'admin' &&
                            <Sidebar.Item href="#" icon={DashboardIcon}>
                                <a  className="flex text-lg items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>nav('/dashboard')}>
                                    {/* <DashboardIcon/> */}
                                    <span className="ms-3">Dashboard</span>
                                </a>
                            </Sidebar.Item>
                        }

                        <Sidebar.Collapse icon={FaWeightScale} label="Weighing" className='text-lg gap-6'>
                            <Sidebar.Item href="#">
                                <a  className="flex text-lg items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>nav('/listtransactions')}> 
                                    <span className="ms-3">List Record</span>
                                </a>
                            </Sidebar.Item>

                            <Sidebar.Item href="#">
                                <a  className="flex text-lg items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>nav(`/addforms/addweightintransaction`)}> 
                                    <span className="ms-3">Add IN Record</span>
                                </a>
                            </Sidebar.Item>

                            <Sidebar.Item href="#">
                                <a  className="flex text-lg items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>nav('/addforms/addweightouttransaction')}>
                                    <span className="ms-3">Add OUT Record</span>
                                </a>
                            </Sidebar.Item>
                        </Sidebar.Collapse>

                        <Sidebar.Collapse icon={FaDownLeftAndUpRightToCenter} label="Internal" className='text-lg gap-6'>
                            <Sidebar.Item href="#">
                                <a  className="flex text-lg items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>nav('/listintrecords')}> 
                                    <span className="ms-3">List Record</span>
                                </a>
                            </Sidebar.Item>

                            <Sidebar.Item href="#">
                                <a  className="flex text-lg items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>nav('/addforms/addintrecord')}>
                                    <span className="ms-3">Add Record</span>
                                </a>
                            </Sidebar.Item>
                        </Sidebar.Collapse>
                        
                        <Sidebar.Collapse icon={FaUpRightAndDownLeftFromCenter} label="External" className='text-lg gap-6'>
                            <Sidebar.Item href="#">
                                <a  className="flex text-lg items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>nav('/listextrecords')}> 
                                    <span className="ms-3">List Record</span>
                                </a>
                            </Sidebar.Item>

                            <Sidebar.Item href="#">
                                <a  className="flex text-lg items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>nav('/addforms/addextrecord')}> 
                                    <span className="ms-3">Add Record</span>
                                </a>
                            </Sidebar.Item>
                        </Sidebar.Collapse>

                        <Sidebar.Item href="#" icon={MdOutlineSettings}>
                            <a  className="flex text-lg items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" onClick={()=>nav(`/settings`)}>
                                <span className="ms-3">Settings</span>
                            </a>
                        </Sidebar.Item>

                        <Sidebar.Item href="#" icon={MdOutlineLogout} className='absolute bottom-4 w-full'>
                            <a  className="flex text-lg items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" onClick={Logout}>
                                <span className="flex-1 ms-3 whitespace-nowrap">Logout</span>
                            </a>
                        </Sidebar.Item>

                        </Sidebar.ItemGroup>
                    </Sidebar.Items>
            </Sidebar>
        </aside>
    </aside>



  )
}

export default CustomSidebar