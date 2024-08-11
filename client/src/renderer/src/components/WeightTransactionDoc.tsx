import { useEffect, useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import CustomSidebar from './Sidebar';
import axios from 'axios';
import { UserContext } from './ContextStore';
import { Document, Page, Text, View, StyleSheet, PDFViewer} from "@react-pdf/renderer"


//proper pdf document for a weight transaction.
//should contain all details in a nice tabular format.
//proper heading with fonts and design
//proper styling for the pdf

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

const generateDocument = (transaction) =>
{

  console.log("Transaction details: ", transaction);

  const {_id = '', type = '', truck_no = '', driver_name = '', driver_contact = '', vendor = {}, goods_type_id = {}, empty_weight = 0, filled_weight = 0, goods_weight = 0, weight_adjust = 0, date_empty_weight, date_filled_weight, employee = {}, is_deleted = false, delete_by = '',delete_reason = '', date_deleted} = transaction;
  const { email, firstName, lastName, role } = employee;
  const { good_name, good_code, good_rate, good_weight } = goods_type_id;
  const { vendor_name, vendor_contact, vendor_poc } = vendor;

  console.log(`id: ${_id}, \ntype: ${type}, \ntruck_no: ${truck_no}, \ndriver_name: ${driver_name}, \ndriver_contact: ${driver_contact}, \nvendor: ${vendor}, \ngoods_type_id: ${goods_type_id}, \nempty_weight: ${empty_weight}, \nfilled_weight: ${filled_weight}, \ngoods_weight: ${goods_weight}, \nweight_adjust: ${weight_adjust}, \ndate_empty_weight: ${date_empty_weight}, \ndate_filled_weight: ${date_filled_weight}, \nemployee: ${employee}, \nis_deleted: ${is_deleted}, \ndelete_by: ${delete_by}, \ndelete_reason: ${delete_reason}`);
  console.log(`email: ${email}, \nfirstName: ${firstName}, \nlastName: ${lastName}, \nrole: ${role}`);
  console.log(`good_name: ${good_name}, \ngood_code: ${good_code}, \ngood_rate: ${good_rate}, \ngood_weight: ${good_weight}`);

  //make the doc look kind of like an invoice. Small part on the top where title is should have a nice background color. rest of the doc should be white.
  //table llike format with decent colors for table header

  return (
    // <div>dummy text</div>
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Weight Transaction Report {"\n\n"}</Text>
        </View>

        <View style={styles.section}>

          <View style={styles.separator} />

          <Text style={styles.subTitle}>Goods Details</Text>
          <Text style={styles.text}>Goods Name: {good_name}</Text>
          <Text style={styles.text}>Goods Code: {good_code}</Text>

          <View style={styles.separator} />

          <Text style={styles.subTitle}>Creator Details</Text>
          <Text style={styles.text}>Email: {email}</Text>
          <Text style={styles.text}>Name: {firstName} {lastName}</Text>
          <Text style={styles.text}>Role: {role}</Text>

          <View style={styles.separator} />

          <Text style={styles.subTitle}>Vendor Details</Text>
          <Text style={styles.text}>Vendor Name: {vendor_name}</Text>
          <Text style={styles.text}>Vendor Contact: {vendor_contact}</Text>
          <Text style={styles.text}>Vendor POC: {vendor_poc}</Text>

          <View style={styles.separator} />

          <Text style={styles.subTitle}>Transaction Details</Text>
          <Text style={styles.text}>Transaction ID: {_id}</Text>
          <Text style={styles.text}>Type: {type}</Text>
          <Text style={styles.text}>Truck No: {truck_no}</Text>
          <Text style={styles.text}>Driver Name: {driver_name}</Text>
          <Text style={styles.text}>Driver Contact: {driver_contact}</Text>
          <Text style={styles.text}>Empty Weight: {empty_weight} kg</Text>
          <Text style={styles.text}>Filled Weight: {filled_weight} kg</Text>
          <Text style={styles.text}>Goods Weight: {goods_weight} kg</Text>
          <Text style={styles.text}>Weight Adjust: {weight_adjust} kg</Text>
          <Text style={styles.text}>Date Empty Weight: {new Date(date_empty_weight).toLocaleDateString()}</Text>
          <Text style={styles.text}>Date Filled Weight: {date_filled_weight ? new Date(date_filled_weight).toLocaleDateString() : 'N/A'}</Text>
          <Text style={styles.text}>Deleted: {is_deleted ? 'Yes' : 'No'}</Text>
          <Text style={styles.text}>Delete Reason: {is_deleted ? delete_reason : 'N/A'}</Text>
          <Text style={styles.text}>Date Deleted: {is_deleted ? new Date(date_deleted).toLocaleDateString() : 'N/A'}</Text>
        </View>

        <View style={styles.separator}/>

      </Page>
    </Document>

  );
}

const WeightTransactionDoc = () => {

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

        axios.get(`${apiUrl}/goods/getIndividualWeighingTransaction`, {params: {transaction_id: transaction_id}})
        .then((res)=>
        {

            if(res.status === 200)
            {
                console.log("Transaction details: ", res.data.transaction);

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

          <button type="button" className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 gap-3" onClick={()=>nav('/listtransactions')}>
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

export default WeightTransactionDoc