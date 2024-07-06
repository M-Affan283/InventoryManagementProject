import {useContext, useEffect} from 'react'
import Sidebar from '../Sidebar'
import { UserContext } from '../ContextStore'
import { useNavigate } from 'react-router-dom';
import AddContainer from './AddContainer';

const AddForms = (props:any) => {

  const {isLogged} = useContext(UserContext);
  const nav = useNavigate();

  useEffect(()=>
  {
    if(!isLogged)
    {
      nav('/');
    }
  },[])


  return (


    // This will contain forms to add new containers, users, and other data.
    // They will be presented in a card grid layout.
    //A search bar to search through the forms will be added.
    <div className='flex flex-row w-full overflow-hidden dark:bg-gray-800 dark:text-white'>
    <Sidebar />
    <div className="p-4 sm:ml-64 bg-gray-100 dark:bg-gray-900 font-mono flex-grow">
      <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
        <p className="text-2xl text-gray-400 dark:text-white">
          Add Truck Information
        </p>
        <br />
        <br />

        {/* add container form moved here. no open form button. remoce every other form. They are to be added inn settings. */}

        {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"> */}
        <AddContainer desktopApp={props.desktopApp} />
        {/* </div> */}


      </div>
    </div>
  </div>
  );
}

export default AddForms