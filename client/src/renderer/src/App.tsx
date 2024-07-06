import { useEffect, useState } from 'react';
import {Route, Routes, BrowserRouter, Navigate} from 'react-router-dom'
import { User, UserContext } from './components/ContextStore';
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import AddForms from './components/Forms/AddForms';
import IndividualContainer from './components/IndividualContainer';
import AllContainers from './components/AllContainers';
import AllEmployees from './components/AllEmployees';
import Settings from './components/Settings';
import "./assets/scrollbar.css"

let temp_user: User = {firstName: "Muhammad", lastName: "Ali", email: "ali@outlook.com", role: "employee", id: "6661c260150c5d01991c3317"};

function App(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);


  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [desktopApp, setDesktopApp] = useState<boolean>(false); //to check if user is using the desktop app or running in browser
  const [comPort, setComPort] = useState<string>('COM5');
  const [baudRate, setBaudRate] = useState<number>(1200);
  const [goodsType, setGoodsType] = useState<string[]>(["Item A", "Item B", "Item C"]);
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
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={isLogged ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/notifications" element={isLogged ? <Notifications /> : <Navigate to="/" />} />
          <Route path="/profile" element={isLogged ? <Profile /> : <Navigate to="/" />} />
          <Route path="/addforms" element={isLogged ? <AddForms desktopApp={desktopApp}/> : <Navigate to="/" />} />
          <Route path="/individualcontainer/:container_id" element={isLogged ? <IndividualContainer desktopApp={desktopApp} /> : <Navigate to="/" />} />
          <Route path="/allcontainers" element={isLogged ? <AllContainers /> : <Navigate to="/" />} />
          <Route path="/allemployees" element={isLogged ? <AllEmployees /> : <Navigate to="/" />} />
          <Route path="/settings" element={isLogged ? <Settings desktopApp={desktopApp}/> : <Navigate to="/" />} />



        {/* !!!!!!!!!!!!!!!!!! TESTING PATHS !!!!!!!!!!!!!!!!!!! */}

        {/* <Route path="/" element={isLogged ? <Dashboard /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={isLogged ? <AddForms desktopApp={desktopApp}/> : <Navigate to="/" />} /> */}
        {/* <Route path="/individualcontainer/:container_id" element={isLogged ? <IndividualContainer desktopApp={desktopApp} /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={isLogged ? <Notifications desktopApp={desktopApp} /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={isLogged ? <AllContainers /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={isLogged ? <AllEmployees /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={isLogged ? <Profile /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={isLogged ? <Settings desktopApp={desktopApp} /> : <Navigate to="/" />} /> */}

        </Routes>
      </UserContext.Provider>
    
    </BrowserRouter>
  )
}

export default App
