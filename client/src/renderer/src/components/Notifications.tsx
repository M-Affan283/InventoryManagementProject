import {useState, useEffect, useContext, useMemo} from 'react'
import axios from 'axios'
import { UserContext } from './ContextStore'
import { useNavigate } from 'react-router-dom'
import {useTable} from 'react-table'
import Sidebar from './Sidebar'

const Notifications = () => {

  const {user, isLogged,apiUrl} = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const nav = useNavigate();

  useEffect(()=>
  {
    if(!isLogged)
    {
      nav('/');
    }

    //fetch all notifications
    try
    {
      axios.get(`${apiUrl}/user/getNotifications`, {params: {email: user?.email}})
      .then((res)=>
      {
        console.log("Notifications received")

        //sort in descending order by notification.time

        res.data.notifications.sort((a, b)=>
        {
          return new Date(b.time).getTime() - new Date(a.time).getTime()
        })

        setNotifications(res.data.notifications)
        console.log(res.data.notifications)
      
      })
      .catch((error)=> console.log(error))
    }
    catch(error)
    {
      console.log(error)
    }



  },[])

  const notifications_columns = [
    {
      Header: 'Type',
      accessor: 'notifType'
    },
    {
      Header: 'Data',
      accessor: 'data'
    },
    {
      Header: 'Time',
      accessor: 'time',
      //display in human readable format:
      Cell: ({row}) => {
        const date = new Date(row.original.time);
        return date.toDateString() + " " + date.toLocaleTimeString();
      }
    }
  ]

  const notifications_columns_memo = useMemo(() => notifications_columns, []);
  const notifications_memo = useMemo(() => (notifications || []), [notifications]);

  const notifications_table = useTable({columns: notifications_columns_memo, data: notifications_memo});

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = notifications_table;



  return (
    <div className='flex flex-row w-full overflow-hidden dark:bg-gray-800 dark:text-white'>
    <Sidebar />
    <div className="p-4 sm:ml-64 bg-gray-100 dark:bg-gray-900 font-mono flex-grow">
      <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
        
        <p className="text-2xl text-gray-400 dark:text-white">
          Change Logs
        </p>
        <br/>
        <br/>
        <br/>

        {notifications && notifications.length > 0 ?

          <table {...getTableProps()} className="w-full text-base text-left rtl:text-right text-gray-500 dark:text-white">
            <thead className="text-base text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">

              {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                            <th {...column.getHeaderProps()} className='px-6 py-3'>
                                {column.render("Header")}
                            </th>
                        ))}
                    </tr>
                ))}

            </thead>

            <tbody {...getTableBodyProps()}>

                {rows.map((row)=>{
                  prepareRow(row);
                  return(
                    <tr {...row.getRowProps()} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      {
                        row.cells.map((cell)=>(
                          <td {...cell.getCellProps()} className="px-6 py-4">
                            {cell.render("Cell")}
                          </td>
                        ))
                      }
                    </tr>
                  )
                })}

            </tbody>
          </table>

          :
          <div className="flex items-center p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
            <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span className="sr-only">Info</span>
            <div>
              <span className="font-medium">No new notifications</span>
            </div>
          </div>
        }

      </div>
    </div>
  </div>
  )
}

export default Notifications