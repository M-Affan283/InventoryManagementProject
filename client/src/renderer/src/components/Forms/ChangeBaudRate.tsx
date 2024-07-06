import {useState, useContext} from 'react'
import { UserContext } from '../ContextStore'

const ChangeBaudRate = (props:any) => {

  const {baudRate,setBaudRate} = useContext(UserContext);
  // const [changePort, setChangePort] = useState(false);
  const [newRate, setRate] = useState('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => {setIsFormOpen(false);};


  const updateRate = (e: any) =>
  {
    e.preventDefault();
    setBaudRate(parseInt(newRate || '0'));
    // setChangePort(!changePort);
  }

  return (
    <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Change Baud Rate</h5>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Change the Baud Rate to read weight data.</p>
        <button onClick={openForm} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Open Form
            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
        </button>

        <br/>


        {isFormOpen && props.desktopApp &&
        
        <div id="popup-modal" className="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 bottom-0 z-50 justify-center items-center w-full md:inset-0 h-full">
          
          <form onSubmit={updateRate}>
            
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-900">
                    <div className="p-4 md:p-5 text-center">
                        <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                        </svg>

                        {/* tell what current baud rate is */}
                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Current Baud Rate: {baudRate}</label>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Please Specify the new Baud Rate</label>
                            <input type="text" id="default-input" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={(e)=>setRate(e.target.value)}/>
                        </div>
                        <button data-modal-hide="popup-modal" type="submit" className="text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                            Confirm
                        </button>
                        <button data-modal-hide="popup-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" onClick={closeForm}>Cancel</button>
                    </div>
                </div>
            </div>
          </form>
          
        </div>
        
        }

        {isFormOpen && !props.desktopApp && (
            <div className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 w-full" role="alert">
                <span className="font-medium">Please use the desktop app to fill in this form.</span>
                <button type="button" onClick={closeForm} className="text-red-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Ok</button>
            </div>
        )}



    </div>
  )
}

export default ChangeBaudRate