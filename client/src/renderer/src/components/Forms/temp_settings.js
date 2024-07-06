const AddForms = (props:any) => {

  const {user, isLogged} = useContext(UserContext);
  const nav = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const forms = [
    {name: "add container", component: <AddContainer desktopApp={props.desktopApp}/>, role: "employee"},
    {name: "change password", component: <ChangePasswordRequest/>, role: "employee"},
    {name: "reset password", component: <ResetPasswordRequest/>, role: "employee"},
    {name: "create user", component: <CreateUser/>, role: "admin"},
    {name: "change password", component: <ChangePassword/>, role: "admin"},
    {name: "reset password", component: <ResetPassword/>, role: "admin"}
  ]

  let filteredForms = forms.filter((form)=>form.name.toLowerCase().includes(searchQuery.toLowerCase()) && form.role === user?.role);

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
          Forms / Requests
        </p>
        <br />


        <br />
        {filteredForms.length > 0 ? (
          <div className='grid grid-cols-4 gap-4'>
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
  );
}

export default AddForms