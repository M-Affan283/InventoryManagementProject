import {useState, useEffect, useContext, useMemo} from 'react'
import { UserContext } from './ContextStore'
import { useNavigate } from 'react-router-dom'
import { useTable } from 'react-table'
import axios from 'axios'
import CustomSidebar from './Sidebar'

const ListOutgoingWeightTransactions = () => {

    const [transactions, setTransactions] = useState([]);
    const [searchQuery, setSearchQuery] = useState<string>(""); //search query for filtering containers
    const [serverResponse, setServerResponse] = useState<string>(""); //server response for fetching containers
    const nav = useNavigate();
    const {user, isLogged, apiUrl} = useContext(UserContext);


    //pagination states
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    

    useEffect(()=>
    {

        if(!isLogged)
        {
        nav('/');
        }

    },[])


    const fetchData = async (searchQuery) =>
    {
        try
        {
            axios.get(`${apiUrl}/goods/getOutgoingWeighingTransactions`, {params: {email: user?.email ,searchQuery: searchQuery, page: page, pageSize: pageSize}})
            .then((res)=>
            {
                console.log("Transactions fetched successfully");
                setTransactions(res.data.transactions);

            })
            .catch((err)=>
            {
                console.log("Failed to fetch transactions: ", err.response.data.message);
                setServerResponse("Error fetching transactions");
            })

        }
        catch(error)
        {
            console.log(error);
            setServerResponse("Error fetching transactions");
        }
    }

    useEffect(() => {
        fetchData(searchQuery);
    }, [page]);
  
    // change back to page 1 if search query changes
    useEffect(() => {
        setPage(1);
        fetchData(searchQuery);
    }, [searchQuery]);
  
    // Pagination handlers
    const nextPage = () => {
        setPage(page + 1);
    }
  
    const prevPage = () => {
        setPage(page - 1);
    }

    const transaction_columns = [
        {
          Header: "Type",
          accessor: "type"
        },
        {
          Header: "Truck Number",
          accessor: "truck_no"
        },
        {
          Header: "Driver Name",
          accessor: "driver_name"
        },
        {
          Header: "Goods Weight",
          accessor: "goods_weight"
        },
        {
          Header: "Goods Type",
          accessor: "goods_type_id",
          //render goods_type_id.good_name only
          Cell: ({row}) => (
            <p>{row.original.goods_type_id.good_name}</p>
          )
        },
        {
          // Header: "Update",
          accessor: "update",
          Cell: ({row}) => (
            <p className="">
                <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={()=>nav(`/individualoutgoingweighttransaction/${row.original._id}`)}>View</button>
            </p>
          )
        }
      ]

      const transaction_columns_memo = useMemo(() => transaction_columns, []);
      const transactions_memo = useMemo(() => (transactions || []), [transactions]);

      const transactions_table = useTable({columns: transaction_columns_memo, data: transactions_memo});
      const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = transactions_table;

  return (
    <div className='flex flex-row w-full overflow-hidden dark:bg-gray-800 dark:text-white'>
      <CustomSidebar />
      <div className="p-4 sm:ml-64 bg-gray-100 dark:bg-gray-900 font-mono flex-grow">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
          
          <p className="text-2xl text-gray-400 dark:text-white">
            Containers
          </p>

          <p className="text-gray-400 dark:text-white">
            {user?.role === "admin" ? "These are all the weight transactions in system database." : "These are all the weight transactions you have added."}
          </p>

          {
            serverResponse &&
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-400 w-full" role="alert">
              <span className="font-medium">{serverResponse}</span>
            </div>
          }

          <br/>
          
          <form className="max-w-md mx-auto">   
            <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input type="search" id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for trucks..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} />
            </div>
          </form>
          <br/>
          {transactions && transactions.length > 0 ?
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
            <div className="flex">
              <button className="flex items-center justify-center px-4 h-10 me-3 text-base font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" onClick={prevPage} disabled={page===1}>
                <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                </svg>
                Previous
              </button>
              <button className="flex items-center justify-center px-4 h-10 text-base font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" onClick={nextPage} disabled={transactions.length < pageSize}>
                Next
                <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                </svg>
              </button>
            </div>
          </>
          :

          <div className="flex items-center p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
            <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span className="sr-only">Info</span>
            <div>
              <span className="font-medium">No containers found</span>
            </div>
          </div>


          }


        </div>
      </div>
  </div>
  )
}

export default ListOutgoingWeightTransactions