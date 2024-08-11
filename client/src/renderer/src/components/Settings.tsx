import {useContext, useEffect} from 'react'
import CustomSidebar from './Sidebar';
import { UserContext } from './ContextStore';
import { useNavigate } from 'react-router-dom';
import CreateUser from './Forms/CreateUser';
import ChangePasswordRequest from './Forms/ChangePasswordRequest';
import ResetPassword from './Forms/ResetPassword';
import ChangeCOMPort from './Forms/ChangeCOMPort';
import ChangeBaudRate from './Forms/ChangeBaudRate';
import AddGoodType from './Forms/AddGoodType';
import AddContractor from './Forms/AddContractor';
import AddVendor from './Forms/AddVendor';

const Settings = (props:any) => {

  const {user, isLogged} = useContext(UserContext);
  const nav = useNavigate();

  const forms = [
    {name: "change password", component: <ChangePasswordRequest/>, role: "employee"},
    {name: "change password", component: <ChangePasswordRequest/>, role: "admin"},
    {name: "reset password", component: <ResetPassword/>, role: "admin"},
    {name: "change com port", component: <ChangeCOMPort desktopApp={props.desktopApp}/>, role: "admin"},
    {name: "change baud rate", component: <ChangeBaudRate desktopApp={props.desktopApp} />, role: "admin"},
    {name: "create user", component: <CreateUser/>, role: "admin"},
    {name: "add good type", component: <AddGoodType/>, role: "admin"},
    {name: "add contractor", component: <AddContractor/>, role: "admin"},
    {name: "add vendor", component: <AddVendor/>, role: "admin"}
  ]

  //filter forms based on user role
  let filteredForms = forms.filter(form => form.role === user?.role);

  useEffect(()=>
  {
    if(!isLogged)
    {
      nav('/');
    }
  },[])

  return (
    <div className='flex flex-row w-full overflow-hidden dark:bg-gray-800 dark:text-white'>
      <CustomSidebar />
      <div className="p-4 sm:ml-64 bg-gray-100 dark:bg-gray-900 font-mono flex-grow">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
          <p className="text-2xl text-gray-400 dark:text-white">
            Forms / Requests
          </p>
          <br />


          <br />
          {filteredForms.length > 0 ? (
            <div className='grid grid-cols-3 gap-4'>
              {filteredForms.map((form, index) => (
                <div key={index}>
                  {form.component}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 w-full" role="alert">
              <span className="font-medium">Form not found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default Settings