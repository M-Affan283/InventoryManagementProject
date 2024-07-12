import {useContext, useEffect} from 'react'
import CustomSidebar from '../Sidebar'
import { UserContext } from '../ContextStore'
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import AddWeightInTransaction from './AddWeightInTransaction';
import AddWeightOutTransaction from './AddWeightOutTransaction';
import AddContractorWork from './AddContractorWork';
import AddExternalTransaction from './AddExternalTransaction';

const AddForms = (props:any) => {

  const {isLogged} = useContext(UserContext);
  const {form_type} = useParams();
  const nav = useNavigate();

  console.log(form_type);

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
    <CustomSidebar />
    <div className="p-4 sm:ml-64 bg-gray-100 dark:bg-gray-900 font-mono flex-grow">
      {
        form_type === "addweightintransaction" ?

          <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
            <p className="text-2xl text-gray-400 dark:text-white">
              Add Weight In Transaction
            </p>
            <br />
            <br />
            <AddWeightInTransaction desktopApp={props.desktopApp} />
        </div>

        :
        form_type === "addweightouttransaction" ?
          
            <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
              <p className="text-2xl text-gray-400 dark:text-white">
                Add Weight Out Transaction
              </p>
              <br />
              <br />
              <AddWeightOutTransaction desktopApp={props.desktopApp} />
            </div>
        :
        form_type === "addintrecord" ?
            
              <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
                <p className="text-2xl text-gray-400 dark:text-white">
                  Add Contractor Work
                </p>
                <br />
                <br />
                <AddContractorWork desktopApp={props.desktopApp} />
              </div>
        :
        form_type === "addextrecord" ?
                
                  <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
                    <p className="text-2xl text-gray-400 dark:text-white">
                      Add External Transaction
                    </p>
                    <br />
                    <br />
                    <AddExternalTransaction desktopApp={props.desktopApp} />
                  </div>
        : null
      }
    </div>
  </div>
  );
}

export default AddForms