import { useEffect, useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import CustomSidebar from './Sidebar';
import axios from 'axios';
import { UserContext } from './ContextStore';
import { Document, Page, Text, View, StyleSheet, PDFViewer} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: '20px',
    backgroundColor: '#ffffff',
  },
  header: {
    padding: '10px',
    backgroundColor: '#f0f0f0',
    marginBottom: '20px',
    borderBottom: '2px solid #003366',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#003366',
  },
  section: {
    marginBottom: '20px',
  },
  subTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',  // Increased margin for better spacing
    borderBottom: '1px solid #cccccc', // Added separator line
    paddingBottom: '5px', // Padding for spacing
  },
  text: {
    fontSize: '13px',
    marginBottom: '8px', // Increased margin for better spacing
  },
  separator: {
    height: '1px',
    backgroundColor: '#cccccc',
    marginVertical: '8px', // Space around the separator
  },
});

//data looks like this:
/*
const ExternalTransactionsSchema = new mongoose.Schema({
    company_name: {type:String, required: true}, //company name
    truck_no: {type:String, required: true}, //truck number
    driver_name: {type:String, required: true}, //name of the driver
    driver_contact: {type:String, required: true}, //contact of the driver
    vehicle_weight: {type:Number, default: 0}, //weight of the vehicle
    external_rate: {type:Number, default: 0}, //rate of the goods
    external_amount: {type:Number, default: 0}, //amount of the goods rate*weight
    date_created: {type:Date, required: true}, //date of account creation
    created_by: {type:mongoose.Schema.Types.ObjectId, ref: "UserInfo", required: false}, //user who created the account
    is_deleted: {type:Boolean, default: false}, //if the account is deleted (1) or not (0)
    date_deleted: {type:Date, required: false}, //date of deletion
    delete_reason: {type:String, required: false} //reason for deletion
})


*/

const generateDocument = (transaction) =>
{
  console.log("Transaction details: ", transaction);

  const {_id = '', company_name = '', truck_no = '', driver_name = '', driver_contact = '', vehicle_weight = 0, external_rate = 0, external_amount = 0, date_created, created_by = {}, is_deleted = false, delete_reason = '', date_deleted} = transaction;
  const { email, firstName, lastName, role } = created_by;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>External Transaction {"\n\n"}</Text>
        </View>

        <View style={styles.separator}/>

        <Text style={styles.subTitle}>Creator Details</Text>
        <Text style={styles.text}>Email: {email}</Text>
        <Text style={styles.text}>Name: {firstName} {lastName}</Text>
        <Text style={styles.text}>Role: {role}</Text>

        <View style={styles.separator} />

        <View style={styles.section}>
          <Text style={styles.subTitle}>Transaction Details</Text>
          <Text style={styles.text}>Transaction ID: {_id}</Text>
          <Text style={styles.text}>Company Name: {company_name}</Text>
          <Text style={styles.text}>Truck No: {truck_no}</Text>
          <Text style={styles.text}>Driver Name: {driver_name}</Text>
          <Text style={styles.text}>Driver Contact: {driver_contact}</Text>
          <Text style={styles.text}>Vehicle Weight: {vehicle_weight}</Text>
          <Text style={styles.text}>External Rate: {external_rate}</Text>
          <Text style={styles.text}>External Amount: {external_amount}</Text>
          <Text style={styles.text}>Date Created: {new Date(date_created).toLocaleDateString()}</Text>
          <Text style={styles.text}>Is Deleted: {is_deleted ? "Yes" : "No"}</Text>
          <Text style={styles.text}>Delete Reason: {is_deleted ? delete_reason : "N/A"}</Text>
          <Text style={styles.text}>Date Deleted: {is_deleted ? new Date(date_deleted).toLocaleDateString() : "N/A"}</Text>
        </View>

        <View style={styles.separator}/>

      </Page>
    </Document>
  )

}

const ExternalTransactionDoc = () => {

  const nav = useNavigate();
  const {transaction_id} = useParams();

  const [transaction, setTransaction] = useState<any>({});

  const {isLogged, apiUrl} = useContext(UserContext);


  useEffect(()=>
    {
        if(!isLogged)
        {
            nav('/');
        }


        try
        {
            axios.get(`${apiUrl}/goods/getIndividualExternalTransaction`, {params: {transaction_id: transaction_id}})
            .then((res)=>
            {

                if(res.status === 200)
                {
                    console.log("Transactions details fetched successfully: ", res.data.transaction);

                    setTransaction(res.data.transaction);
                }
                else
                {
                    console.log("Failed to fetch transactions details: ", res.data);
                }

            })
            .catch((err)=>
            {
                console.log("Failed to fetch transactions details: ", err);
            })

        }
        catch(error)
        {
            console.log("Failed to fetch transactions details: ", error);
        }


    },[])

  return (
    <div className='flex flex-row w-full overflow-hidden dark:bg-gray-800 dark:text-white'>
        <CustomSidebar />
        <div className="p-4 sm:ml-64 bg-gray-100 dark:bg-gray-900 font-mono flex-grow">
          <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
            <br/>

            <button type="button" className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 gap-3" onClick={()=>nav('/listintrecords')}>
              <ArrowBackIcon/>
              Back
            </button>

            <br/>
            <br/>


            {transaction ? (
                <PDFViewer width="100%" height="800px">
                  {generateDocument(transaction)}
                </PDFViewer>

            )
            :
            <div className="flex justify-center items-center h-96">
              <CircularProgress />
            </div>  
          }

          </div>
        </div>
      </div>
  )
}

export default ExternalTransactionDoc