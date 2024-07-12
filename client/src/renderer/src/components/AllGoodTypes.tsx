import {useState, useEffect, useContext, useMemo} from 'react'
import { UserContext } from './ContextStore'
import { useNavigate } from 'react-router-dom'
import { useTable } from 'react-table'
import axios from 'axios'
import CustomSidebar from './Sidebar'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AllGoodTypes = () => {

    const [goodTypes, setGoodTypes] = useState([]);
    const [serverResponse, setServerResponse] = useState<string>(""); //server response for fetching employees
    const nav = useNavigate();
    const {user, isLogged,apiUrl} = useContext(UserContext);

    useEffect(()=>
    {
    
        if(!isLogged || user?.role !== "admin")
        {
            nav('/');
        }

        try
        {

            axios.get(`${apiUrl}/goods/getGoodsTypes`)
            .then((res)=>
            {
                console.log("Goods types fetched successfully");
                setGoodTypes(res.data.goods);
            })
            .catch((err)=>
            {
                console.log("Failed to fetch goods types: ", err.response.data.message);
                setServerResponse("Error fetching goods types");
            })

        }
        catch(error)
        {
            console.log(error)
            setServerResponse("Error fetching goods types");
        }
    
    },[])


    const good_columns = [
        {
            Header: 'Good Name',
            accessor: 'good_name'
        },
        {
            Header: 'Good Code',
            accessor: 'good_code'
        },
        {
            Header: 'Good Rate',
            accessor: 'good_rate'
        }
    ]

    const good_columns_memo = useMemo(() => good_columns, []);
    const good_data = useMemo(() => (goodTypes || []), [goodTypes]);

    const goods_table = useTable({columns: good_columns_memo, data: good_data});

    const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = goods_table;


  return (
    <div className='flex flex-row w-full overflow-hidden dark:bg-gray-800 dark:text-white'>
      <CustomSidebar />
      <div className="p-4 sm:ml-64 bg-gray-100 dark:bg-gray-900 font-mono flex-grow">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
          
          <p className="text-2xl text-gray-400 dark:text-white">
            Good Types
          </p>

          <p className="text-gray-400 dark:text-white">
            These are all the good types in the system database.
          </p>

          <br/>
          <button type="button" className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 gap-3" onClick={()=>nav('/settings')}>
            <ArrowBackIcon/>
            Back
          </button>


          <br/>
          {
            serverResponse &&
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-400 w-full" role="alert">
              <span className="font-medium">{serverResponse}</span>
            </div>
          }

          <br/>
          {goodTypes && goodTypes.length > 0 ?
            <>

              {/* Search bar */}


              <br/>
              <br/>

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
            
            <br/>
          </>
          :

          <div className="flex items-center p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
            <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span className="sr-only">Info</span>
            <div>
              <span className="font-medium">No Goods found</span>
            </div>
          </div>


          }


        </div>
      </div>
  </div>
  )
}

export default AllGoodTypes