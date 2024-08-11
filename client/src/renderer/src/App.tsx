import { useEffect, useState } from 'react';
import {Route, Routes, BrowserRouter, Navigate} from 'react-router-dom'
import { User, UserContext } from './components/ContextStore';
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import AddForms from './components/Forms/AddForms';
import AllEmployees from './components/AllEmployees';
import AllContractors from './components/AllContractors';
import AllGoodTypes from './components/AllGoodTypes';
import AllVendors from './components/AllVendors';
import Settings from './components/Settings';
import ListWeightTransactions from './components/ListWeightTransactions';
import ListOutgoingWeightTransactions from './components/ListOutgoingWeightTransactions';
import ListInternalTransactions from './components/ListInternalTransactions';
import ListExternalTransactions from './components/ListExternalTransactions';
import IndividualWeightTransaction from './components/IndividualWeightTransaction';
import IndividualOutgoingWeightTransaction from './components/IndividualOutgoingWeightTransaction';
import IndividualInternalTransaction from './components/IndividualInternalTransaction';
import IndividualExternalTransaction from './components/IndividualExternalTransaction';
import WeightTransactionDoc from './components/WeightTransactionDoc';
import OutgoingWeightTransactionDoc from './components/OutgoingWeightTransactionDoc';
import InternalTransactionDoc from './components/InternalTransactionDoc';
import ExternalTransactionDoc from './components/ExternalTransactionDoc';
import "./assets/scrollbar.css"

let temp_user: User = {firstName: "Muhammad", lastName: "Ali", email: "maffan@outlook.com", role: "admin", id: "6661c260150c5d01991c3317"};

function App(): JSX.Element {
  const [user, setUser] = useState<User | null>(temp_user);


  const [isLogged, setIsLogged] = useState<boolean>(true);
  const [desktopApp, setDesktopApp] = useState<boolean>(false); //to check if user is using the desktop app or running in browser
  const [comPort, setComPort] = useState<string>('COM4');
  const [baudRate, setBaudRate] = useState<number>(1200);
  const [goodsType, setGoodsType] = useState<any[]>([{good_name: "Aluminium", good_code: '1', good_rate: 100}, {good_name: "Steel", good_code: '2', good_rate: 200}]);
  const apiUrl = "http://localhost:5000";
  //check if user is using desktop app
  useEffect(()=>
  {
    if(window.electron)
    {
      setDesktopApp(true);
      // console.log("Running in desktop app")
    }
    else
    {
      // console.log("Running in browser")
    }

  },[])

  // useEffect(() => {
  //   localStorage.setItem('user', JSON.stringify(user));
  // }, [user]);

  // useEffect(() => {
  //   localStorage.setItem('isLogged', JSON.stringify(isLogged));
  // }, [isLogged]);


  return (
    <BrowserRouter>
    
      <UserContext.Provider value= {{user, isLogged, comPort, baudRate, goodsType,apiUrl ,setUser, setIsLogged, setComPort, setBaudRate, setGoodsType}}>
        <Routes>

          {/* !!!!!!!!!!!!!!!! ACTUAL PATHS !!!!!!!!!!!!!!!!!!!! */}
          {/* <Route path="/" element={<Login />} /> */}
          <Route path="/dashboard" element={isLogged ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/notifications" element={isLogged ? <Notifications /> : <Navigate to="/" />} />
          <Route path="/profile" element={isLogged ? <Profile /> : <Navigate to="/" />} />
          <Route path="/addforms/:form_type" element={isLogged ? <AddForms desktopApp={desktopApp}/> : <Navigate to="/" />} />
          <Route path="/allemployees" element={isLogged ? <AllEmployees /> : <Navigate to="/" />} />
          <Route path="/allcontractors" element={isLogged ? <AllContractors /> : <Navigate to="/" />} />
          <Route path="/allgoodtypes" element={isLogged ? <AllGoodTypes /> : <Navigate to="/" />} />
          <Route path="/allvendors" element={isLogged ? <AllVendors /> : <Navigate to="/" />} />
          <Route path="/listtransactions" element={isLogged ? <ListWeightTransactions /> : <Navigate to="/" />} />
          <Route path="/listoutgoingtransactions" element={isLogged ? <ListOutgoingWeightTransactions /> : <Navigate to="/" />} />
          <Route path="/listintrecords" element={isLogged ? <ListInternalTransactions /> : <Navigate to="/" />} />
          <Route path="/listextrecords" element={isLogged ? <ListExternalTransactions /> : <Navigate to="/" />} />
          <Route path="/individualweighttransaction/:transaction_id" element={isLogged ? <IndividualWeightTransaction desktopApp={desktopApp} /> : <Navigate to="/" />} />
          <Route path="/genweightpdf/:transaction_id" element={isLogged ? <WeightTransactionDoc /> : <Navigate to="/" />} />
          <Route path="/individualoutgoingweighttransaction/:transaction_id" element={isLogged ? <IndividualOutgoingWeightTransaction desktopApp={desktopApp} /> : <Navigate to="/" />} />
          <Route path="/genoutgoingweightpdf/:transaction_id" element={isLogged ? <OutgoingWeightTransactionDoc /> : <Navigate to="/" />} />
          <Route path="/individualinttransaction/:transaction_id" element={isLogged ? <IndividualInternalTransaction desktopApp={desktopApp} /> : <Navigate to="/" />} />
          <Route path="/genintpdf/:transaction_id" element={isLogged ? <InternalTransactionDoc /> : <Navigate to="/" />} />
          <Route path="/individualexttransaction/:transaction_id" element={isLogged ? <IndividualExternalTransaction desktopApp={desktopApp} /> : <Navigate to="/" />} />
          <Route path="/genextpdf/:transaction_id" element={isLogged ? <ExternalTransactionDoc /> : <Navigate to="/" />} />
          <Route path="/settings" element={isLogged ? <Settings desktopApp={desktopApp}/> : <Navigate to="/" />} />



        {/* !!!!!!!!!!!!!!!!!! TESTING PATHS !!!!!!!!!!!!!!!!!!! */}

        {/* <Route path="/" element={isLogged ? <Dashboard /> : <Navigate to="/" />} /> */}
        {/* <Route path="/addforms/:form_type" element={isLogged ? <AddForms desktopApp={desktopApp}/> : <Navigate to="/" />} /> */}
        {/* <Route path="/individualcontainer/:container_id" element={isLogged ? <IndividualContainer desktopApp={desktopApp} /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={isLogged ? <Notifications desktopApp={desktopApp} /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={isLogged ? <AllContainers /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={isLogged ? <AllEmployees /> : <Navigate to="/" />} /> */}
        <Route path="/" element={isLogged ? <Profile /> : <Navigate to="/" />} />
        {/* <Route path="/" element={isLogged ? <Settings desktopApp={desktopApp} /> : <Navigate to="/" />} /> */}
        {/* <Route path="/allemployees" element={isLogged ? <AllEmployees /> : <Navigate to="/" />} /> */}
        {/* <Route path="/allcontractors" element={isLogged ? <AllContractors /> : <Navigate to="/" />} /> */}
        {/* <Route path="/allgoodtypes" element={isLogged ? <AllGoodTypes /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={isLogged ? <ListWeightTransactions /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={isLogged ? <ListInternalTransactions /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={isLogged ? <ListExternalTransactions /> : <Navigate to="/" />} /> */}
        {/* <Route path="/individualweighttransaction/:transaction_id" element={isLogged ? <IndividualWeightTransaction desktopApp={desktopApp} /> : <Navigate to="/" />} /> */}
        {/* <Route path="/individualinttransaction/:transaction_id" element={isLogged ? <IndividualInternalTransaction desktopApp={desktopApp} /> : <Navigate to="/" />} /> */}
        {/* <Route path="/individualexttransaction/:transaction_id" element={isLogged ? <IndividualExternalTransaction desktopApp={desktopApp} /> : <Navigate to="/" />} /> */}

        </Routes>
      </UserContext.Provider>
    
    </BrowserRouter>
  )
}

export default App
