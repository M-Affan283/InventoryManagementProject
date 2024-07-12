
//Dashboard will show tables of all containers. May add pagination, and a search bar to filter through containers. (if supervisor)
//If employee then it will show the containers assigned to them.
//If admin then it will show all containers.

/// CHANGE EDIT TO VIEW
/// ADD BACK BUTTON WHEN ROUTING TO INDIVIDIUAL VCONTAINER
//CHANGE BASE WEIGHT TO EMPTY. ADD DRIVER NAME,BASE WEIGHT, FINAL WEIGHT AND  GOODS WEIGHT
//SETTINGS SECTION FOR BOTH ADMIN AND EMPLOYE
//CHANGE PASSWORD ALLOWED FOR EMPLOYEE. NO NEED TO SEND REQUEST
//REMOCE RESET PASSWORD
//DASHOARD TO CONTAIN SUMMARY. TODAY, FOR THIS WEEK, FOR THIS MONTH, FOR THIS QUARTER. TOTAL TRUCKS INCOMING/OUTGOING. Types of item and their weight that came and went.

import {useEffect, useState, useContext} from 'react'
import { UserContext } from './ContextStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomSidebar from './Sidebar';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Divider from '@mui/material/Divider';
import {
  mangoFusionPalette,
  cheerfulFiestaPalette,
} from '@mui/x-charts/colorPalettes';
import { ContentCutOutlined } from '@mui/icons-material';

/* UPDATE DATA IS NOW IN THE FORM:

  {
  "data": {
    "weight_transaction_widget_data": {
      "today": {
        "incoming": 0,
        "outgoing": 0,
        "goods_weight": {
          "incoming": [],
          "outgoing": []
        }
      },
      "this_week": {
        "incoming": 4,
        "outgoing": 2,
        "goods_weight": {
          "incoming": [
            {
              "value": 200,
              "label": "Aluminium"
            },
            {
              "value": 100,
              "label": "Steel"
            }
          ],
          "outgoing": [
            {
              "value": 500,
              "label": "Aluminium"
            },
            {
              "value": 1086,
              "label": "Steel"
            }
          ]
        }
      },
      "this_month": {
        "incoming": 4,
        "outgoing": 2,
        "goods_weight": {
          "incoming": [
            {
              "value": 200,
              "label": "Aluminium"
            },
            {
              "value": 100,
              "label": "Steel"
            }
          ],
          "outgoing": [
            {
              "value": 500,
              "label": "Aluminium"
            },
            {
              "value": 1086,
              "label": "Steel"
            }
          ]
        }
      }
    },
    "internal_transaction_widget_data": {
      "today": {
        "goods_weight": [],
        "work_amount": []
      },
      "this_week": {
        "goods_weight": [
          {
            "value": 300,
            "label": "Aluminium"
          },
          {
            "value": 700,
            "label": "Steel"
          }
        ],
        "work_amount": [
          {
            "value": 15000,
            "label": "Aluminium"
          },
          {
            "value": 70000,
            "label": "Steel"
          }
        ]
      },
      "this_month": {
        "goods_weight": [
          {
            "value": 300,
            "label": "Aluminium"
          },
          {
            "value": 700,
            "label": "Steel"
          }
        ],
        "work_amount": [
          {
            "value": 15000,
            "label": "Aluminium"
          },
          {
            "value": 70000,
            "label": "Steel"
          }
        ]
      }
    },
    "external_transaction_widget_data": {
      "today": {
        "vehicle_weight": [],
        "external_amount": []
      },
      "this_week": {
        "vehicle_weight": [
          {
            "value": 5000,
            "label": "WorldCall"
          },
          {
            "value": 8000,
            "label": "FAST"
          },
          {
            "value": 5000,
            "label": "Google"
          },
          {
            "value": 2500,
            "label": "Facebook"
          }
        ],
        "external_amount": [
          {
            "value": 1650000,
            "label": "WorldCall"
          },
          {
            "value": 2000000,
            "label": "FAST"
          },
          {
            "value": 1000000,
            "label": "Google"
          },
          {
            "value": 375000,
            "label": "Facebook"
          }
        ]
      },
      "this_month": {
        "vehicle_weight": [
          {
            "value": 5000,
            "label": "WorldCall"
          },
          {
            "value": 8000,
            "label": "FAST"
          },
          {
            "value": 5000,
            "label": "Google"
          },
          {
            "value": 2500,
            "label": "Facebook"
          }
        ],
        "external_amount": [
          {
            "value": 1650000,
            "label": "WorldCall"
          },
          {
            "value": 2000000,
            "label": "FAST"
          },
          {
            "value": 1000000,
            "label": "Google"
          },
          {
            "value": 375000,
            "label": "Facebook"
          }
        ]
      }
    }
  }
}


*/


const Dashboard = () => {
    const nav = useNavigate();

    const {user, isLogged,apiUrl} = useContext(UserContext);
    
    const [widgetData, setWidgetData] = useState<any>(null);

    const [weightTransactionWidgetData, setWeightTransactionWidgetData] = useState<any>(null);
    const [internalTransactionWidgetData, setInternalTransactionWidgetData] = useState<any>(null);
    const [externalTransactionWidgetData, setExternalTransactionWidgetData] = useState<any>(null);

    //for weigth transaction widget data
    const [todayIncoming, setTodayIncoming] = useState<any[]>([]);
    const [todayOutgoing, setTodayOutgoing] = useState<any[]>([]);
    const [thisWeekIncoming, setThisWeekIncoming] = useState<any[]>([]);
    const [thisWeekOutgoing, setThisWeekOutgoing] = useState<any[]>([]);
    const [thisMonthIncoming, setThisMonthIncoming] = useState<any[]>([]);
    const [thisMonthOutgoing, setThisMonthOutgoing] = useState<any[]>([]);

    //for internal transaction widget data

    const [internalTodayGoodsWeight, setInternalTodayGoodsWeight] = useState<any[]>([]);
    const [internalThisWeekGoodsWeight, setInternalThisWeekGoodsWeight] = useState<any[]>([]);
    const [internalThisMonthGoodsWeight, setInternalThisMonthGoodsWeight] = useState<any[]>([]);
    const [internalTodayWorkAmount, setInternalTodayWorkAmount] = useState<any[]>([]);
    const [internalThisWeekWorkAmount, setInternalThisWeekWorkAmount] = useState<any[]>([]);
    const [internalThisMonthWorkAmount, setInternalThisMonthWorkAmount] = useState<any[]>([]);

    //for external transaction widget data
    const [externalTodayVehicleWeight, setExternalTodayVehicleWeight] = useState<any[]>([]);
    const [externalThisWeekVehicleWeight, setExternalThisWeekVehicleWeight] = useState<any[]>([]);
    const [externalThisMonthVehicleWeight, setExternalThisMonthVehicleWeight] = useState<any[]>([]);
    const [externalTodayExternalAmount, setExternalTodayExternalAmount] = useState<any[]>([]);
    const [externalThisWeekExternalAmount, setExternalThisWeekExternalAmount] = useState<any[]>([]);
    const [externalThisMonthExternalAmount, setExternalThisMonthExternalAmount] = useState<any[]>([]);


    useEffect(()=>
    {
        if(!isLogged)
        {
          nav('/');
        }

        if(user?.role === 'employee')
        {
          nav('/profile')
        }

        axios.get(`${apiUrl}/goods/widgetData`, {params: {email: user?.email}})
        .then((res)=>
        {
            setWidgetData(res.data.data);

            setWeightTransactionWidgetData(res.data.data.weight_transaction_widget_data);
            setInternalTransactionWidgetData(res.data.data.internal_transaction_widget_data);
            setExternalTransactionWidgetData(res.data.data.external_transaction_widget_data);

        })
        .catch((err)=>
        {
            console.log(err);
        
        })

    },[])


    //must first convert data inn widgetData to series data for pie chart
    const convertWeightTransactionToPieData = (data: any) =>
    {
      //take the widgetData and convert it to the format required for the pie chart
      //total 6 pie charts. 3 for incoming and 3 for outgoing. Today, this week and this month
      // console.log("Data: ", data)
      setTodayIncoming(data.today.goods_weight.incoming);
      setTodayOutgoing(data.today.goods_weight.outgoing);
      setThisWeekIncoming(data.this_week.goods_weight.incoming);
      setThisWeekOutgoing(data.this_week.goods_weight.outgoing);
      setThisMonthIncoming(data.this_month.goods_weight.incoming);
      setThisMonthOutgoing(data.this_month.goods_weight.outgoing);
    }

    const convertInternalTransactionToPieData = (data: any) =>
    {
      // console.log("Data: ", data)
      setInternalTodayGoodsWeight(data.today.goods_weight);
      setInternalThisWeekGoodsWeight(data.this_week.goods_weight);
      setInternalThisMonthGoodsWeight(data.this_month.goods_weight);
      setInternalTodayWorkAmount(data.today.work_amount);
      setInternalThisWeekWorkAmount(data.this_week.work_amount);
      setInternalThisMonthWorkAmount(data.this_month.work_amount);
    
    }

    const convertExternalTransactionToPieData = (data: any) =>
    {
      // console.log("Data: ", data)
      setExternalTodayVehicleWeight(data.today.vehicle_weight);
      setExternalThisWeekVehicleWeight(data.this_week.vehicle_weight);
      setExternalThisMonthVehicleWeight(data.this_month.vehicle_weight);
      setExternalTodayExternalAmount(data.today.external_amount);
      setExternalThisWeekExternalAmount(data.this_week.external_amount);
      setExternalThisMonthExternalAmount(data.this_month.external_amount);
    }

    useEffect(()=>
    {
      if(weightTransactionWidgetData)
      {
        convertWeightTransactionToPieData(weightTransactionWidgetData);
      }
    
    },[weightTransactionWidgetData])

    useEffect(()=>
    {
      if(internalTransactionWidgetData)
      {
        convertInternalTransactionToPieData(internalTransactionWidgetData);
      }
    },[internalTransactionWidgetData])

    useEffect(()=>
    {
      if(externalTransactionWidgetData)
      {
        convertExternalTransactionToPieData(externalTransactionWidgetData);
      }
    
    },[externalTransactionWidgetData])


  return (
    <div className='flex flex-row w-full overflow-hidden dark:bg-gray-800 dark:text-white'>
      <CustomSidebar/>
      <div className="p-4 sm:ml-64 bg-gray-100 dark:bg-gray-900 font-mono flex-grow">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 min-h-screen w-full overflow-y-auto">
          
          <div className='grid grid-cols-2 sm:grid-cols-2 gap-4'>
            <p className="text-2xl text-gray-400 dark:text-white">
              Hello, {user?.firstName} {user?.lastName}
            </p>
            <p className="text-2xl text-gray-400 dark:text-white">
              Today's Date: {new Date().toDateString()}
            </p>
          </div>


          <br/>
          {
            weightTransactionWidgetData ? 
            <div>
              
              <br/>

              {/* title */}

              <h3 className="text-2xl font-bold underline dark:text-white">Summary of weight transaction data:</h3>

              <br/>

              <h4 className="text-2xl font-bold underline dark:text-white">Todays's Data:</h4>

              <br/>
              <Grid sx={{ flexGrow: 1 }} container spacing={5}>
                  <Grid item xs={12}>
                    <Grid container justifyContent="center" spacing={5}>
                      <Grid item>
                        {/* rounded corners background color dark, white text width 150 height 140 text centre */}
                          <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                            <CardContent>
                              <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
                                Incoming Trucks Count:
                              </Typography>
                              <br/> 
                              <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                                {weightTransactionWidgetData.today.incoming}
                              </Typography>
                            </CardContent>
                          </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Outgoing Trucks Count:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {weightTransactionWidgetData.today.outgoing}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Incoming Total Weight:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {todayIncoming ? todayIncoming.reduce((acc: number, curr: any)=> acc + curr.value, 0) : 0} kg
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Outgoing Total Weight:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {todayOutgoing ? todayOutgoing.reduce((acc: number, curr: any)=> acc + curr.value, 0) : 0} kg
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <br/>
                <br/>
                <br/>

                {/* PIE CHART FOR TODAY GOODS WEIGHT incoming and outgoing in centre in grid format*/}
                <div className="flex justify-center items-center">
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Incoming Weight by Goods Type:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: todayIncoming,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={cheerfulFiestaPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          },
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Outgoing Weight by Goods Type:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: todayOutgoing,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={mangoFusionPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                  </Grid>
                </div>

                {/* white divider */}

                {/* Similar to today's data, display this week's data */}
                <br/>
                <Divider sx={{bgcolor:'white'}}></Divider>
                <br/>

                {/*  make heading stand out. underline, bold, bigger font */}
                <h4 className="text-2xl font-bold underline dark:text-white">This Week's Data:</h4>

                <br/>

                <Grid sx={{ flexGrow: 1 }} container spacing={5}>
                  <Grid item xs={12}>
                    <Grid container justifyContent="center" spacing={5}>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Incoming Trucks Count:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {weightTransactionWidgetData.this_week.incoming}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Outgoing Trucks Count:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {weightTransactionWidgetData.this_week.outgoing}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Incoming Total Weight:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {thisWeekIncoming ? thisWeekIncoming.reduce((acc: number, curr: any)=> acc + curr.value, 0) : 0} kg
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Outgoing Total Weight:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {thisWeekOutgoing ? thisWeekOutgoing.reduce((acc: number, curr: any)=> acc + curr.value, 0) : 0} kg
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <br/>
                <br/>
                <br/>

                {/* PIE CHART FOR THIS WEEK GOODS WEIGHT incoming and outgoing in centre in grid format*/}

                <div className="flex justify-center items-center">
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Incoming Weight by Goods Type:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: thisWeekIncoming,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={cheerfulFiestaPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Outgoing Weight by Goods Type:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: thisWeekOutgoing,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={mangoFusionPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                  </Grid>
                </div>  


                {/* Similar to today's data, display this month's data */}
                <br/>
                <Divider sx={{bgcolor:'white'}}></Divider>
                <br/>

                <h4 className="text-2xl font-bold underline dark:text-white">This Month's Data:</h4>

                <br/>

                <Grid sx={{ flexGrow: 1 }} container spacing={5}>
                  <Grid item xs={12}>
                    <Grid container justifyContent="center" spacing={5}>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Incoming Trucks Count:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {weightTransactionWidgetData.this_month.incoming}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Outgoing Trucks Count:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {weightTransactionWidgetData.this_month.outgoing}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Incoming Total Weight:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {thisMonthIncoming ? thisMonthIncoming.reduce((acc: number, curr: any)=> acc + curr.value, 0) : 0} kg
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Outgoing Total Weight:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {thisMonthOutgoing ? thisMonthOutgoing.reduce((acc: number, curr: any)=> acc + curr.value, 0) : 0} kg
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <br/>
                <br/>
                <br/>

                {/* PIE CHART FOR THIS MONTH GOODS WEIGHT incoming and outgoing in centre in grid format*/}
                <div className="flex justify-center items-center">
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Incoming Weight by Goods Type:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: thisMonthIncoming,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={cheerfulFiestaPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Outgoing Weight by Goods Type:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: thisMonthOutgoing,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={mangoFusionPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                  </Grid>
                </div>

                <br/>
                <Divider sx={{bgcolor:'white'}}></Divider>
                <br/>

            </div>
            :
            <div className="flex justify-center items-center h-96">
              <CircularProgress />
            </div>
          }

          { internalTransactionWidgetData ? 

                  <div>
                                
                    <br/>

                    <h3 className="text-2xl font-bold underline dark:text-white">Summary of internal transaction data:</h3>

                    <br/>

                    <h4 className="text-2xl font-bold underline dark:text-white">Todays's Data:</h4>

                    <br/>

                    {/* only need to show 2 cards one to show total weight handled and one for total work mount */}

                    <Grid sx={{ flexGrow: 1 }} container spacing={5}>
                      <Grid item xs={12}>
                        <Grid container justifyContent="center" spacing={5}>
                          <Grid item>
                            <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                              <CardContent>
                                <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                                  Total Weight Handled:
                                </Typography>
                                <br/>
                                <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                                  {internalTransactionWidgetData.today.goods_weight.reduce((acc: number, curr: any)=> acc + curr.value, 0)} kg
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item>
                            <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                              <CardContent>
                                <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                                  Total Work Amount:
                                </Typography>
                                <br/>
                                <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                                  {internalTransactionWidgetData.today.work_amount.reduce((acc: number, curr: any)=> acc + curr.value, 0)}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                      </Grid>
                   </Grid>
                  </Grid>

                  <br/>
                  <br/>
                  <br/>

                  {/* Now pie chart for today's goods weight and work amount */}
                  <div className="flex justify-center items-center">
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Weight by Goods Type:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: internalTodayGoodsWeight,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={cheerfulFiestaPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Work Amount by Goods Type:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: internalTodayWorkAmount,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={mangoFusionPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                  </Grid>
                </div>

                <br/>
                <Divider sx={{bgcolor:'white'}}></Divider>
                <br/>

                
                {/* Similar to today's data, display this week's data */}
                <br/>
                <h4 className="text-2xl font-bold underline dark:text-white">This Week's Data:</h4>

                <br/>

                <Grid sx={{ flexGrow: 1 }} container spacing={5}>
                  <Grid item xs={12}>
                    <Grid container justifyContent="center" spacing={5}>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Total Weight Handled:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {internalTransactionWidgetData.this_week.goods_weight.reduce((acc: number, curr: any)=> acc + curr.value, 0)} kg
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Total Work Amount:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {internalTransactionWidgetData.this_week.work_amount.reduce((acc: number, curr: any)=> acc + curr.value, 0)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>

                </Grid>

                <br/>
                <br/>
                <br/>

                {/* Now pie chart for this week's goods weight and work amount */}
                <div className="flex justify-center items-center">
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Weight by Goods Type:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: internalThisWeekGoodsWeight,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={cheerfulFiestaPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Work Amount by Goods Type:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: internalThisWeekWorkAmount,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={mangoFusionPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                  </Grid>
                </div>

                <br/>
                <Divider sx={{bgcolor:'white'}}></Divider>
                <br/>

                {/* Similar to today's data, display this month's data */}
                <br/>

                <h4 className="text-2xl font-bold underline dark:text-white">This Month's Data:</h4>

                <br/>

                <Grid sx={{ flexGrow: 1 }} container spacing={5}>
                  <Grid item xs={12}>
                    <Grid container justifyContent="center" spacing={5}>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Total Weight Handled:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {internalTransactionWidgetData.this_month.goods_weight.reduce((acc: number, curr: any)=> acc + curr.value, 0)} kg
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Total Work Amount:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {internalTransactionWidgetData.this_month.work_amount.reduce((acc: number, curr: any)=> acc + curr.value, 0)} 
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <br/>
                <br/>
                <br/>

                {/* Now pie chart for this month's goods weight and work amount */}
                <div className="flex justify-center items-center">
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Weight by Goods Type:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: internalThisMonthGoodsWeight,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={cheerfulFiestaPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Work Amount by Goods Type:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: internalThisMonthWorkAmount,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={mangoFusionPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                  </Grid>
                </div>
                
                
                <br/>
                <Divider sx={{bgcolor:'white'}}></Divider>
                <br/>


                </div>
              : 
              <div className="flex justify-center items-center h-96">
                <CircularProgress />
              </div>
          }


          { externalTransactionWidgetData ?

            // with external transaction data, we only need to show the total weight handled and total external amount
            //sepearation in pie char by company name

              <div>
                                  
                  <br/>

                  <h3 className="text-2xl font-bold underline dark:text-white">Summary of External transaction data:</h3>

                  <br/>

                  <h4 className="text-2xl font-bold underline dark:text-white">Todays's Data:</h4>

                  <br/>

                  {/* only need to show 2 cards one to show total weight handled and one for total external amount */}

                  <Grid sx={{ flexGrow: 1 }} container spacing={5}>
                      <Grid item xs={12}>
                        <Grid container justifyContent="center" spacing={5}>
                          <Grid item>
                            <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                              <CardContent>
                                <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                                  Total Vehicle Weight Handled:
                                </Typography>
                                <br/>
                                <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                                  {externalTransactionWidgetData.today.vehicle_weight.reduce((acc: number, curr: any)=> acc + curr.value, 0)} kg
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item>
                            <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                              <CardContent>
                                <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                                  Total External Amount:
                                </Typography>
                                <br/>
                                <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                                  {externalTransactionWidgetData.today.external_amount.reduce((acc: number, curr: any)=> acc + curr.value, 0)} 
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  <br/>
                  <br/>
                  <br/>

                  {/* Now pie chart for today's vehicle weight and external amount */}
                  <div className="flex justify-center items-center">
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Weight by Company:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: externalTodayVehicleWeight,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={cheerfulFiestaPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">External Amount by Company:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} `,
                            data: externalTodayExternalAmount,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={mangoFusionPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                  </Grid>
                </div>

                <br/>
                <Divider sx={{bgcolor:'white'}}></Divider>
                <br/>

                
                {/* Similar to today's data, display this week's data */}
                <br/>
                <h4 className="text-2xl font-bold underline dark:text-white">This Week's Data:</h4>

                <br/>

                <Grid sx={{ flexGrow: 1 }} container spacing={5}>
                  <Grid item xs={12}>
                    <Grid container justifyContent="center" spacing={5}>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Total Vehicle Weight Handled:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {externalTransactionWidgetData.this_week.vehicle_weight.reduce((acc: number, curr: any)=> acc + curr.value, 0)} kg
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Total External Amount:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {externalTransactionWidgetData.this_week.external_amount.reduce((acc: number, curr: any)=> acc + curr.value, 0)} 
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <br/>
                <br/>
                <br/>

                {/* Now pie chart for this week's vehicle weight and external amount */}
                <div className="flex justify-center items-center">
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Weight by Company:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: externalThisWeekVehicleWeight,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={cheerfulFiestaPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">External Amount by Company:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} `,
                            data: externalThisWeekExternalAmount,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={mangoFusionPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                  </Grid>
                </div>

                <br/>
                <Divider sx={{bgcolor:'white'}}></Divider>
                <br/>

                {/* Similar to today's data, display this month's data */}
                <br/>

                <h4 className="text-2xl font-bold underline dark:text-white">This Month's Data:</h4>

                <br/>

                <Grid sx={{ flexGrow: 1 }} container spacing={5}>
                  <Grid item xs={12}>
                    <Grid container justifyContent="center" spacing={5}>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Total Vehicle Weight Handled:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {externalTransactionWidgetData.this_month.vehicle_weight.reduce((acc: number, curr: any)=> acc + curr.value, 0)} kg
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item>
                        <Card variant='outlined' sx={{ backgroundColor: '#374151', borderRadius: '15px', color: 'white', width: 250, height: 150 }}>
                          <CardContent>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize:'1.1rem' }}>
                              Total External Amount:
                            </Typography>
                            <br/>
                            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontSize: '3rem' }}>
                              {externalTransactionWidgetData.this_month.external_amount.reduce((acc: number, curr: any)=> acc + curr.value, 0)} 
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <br/>
                <br/>
                <br/>

                {/* Now pie chart for this month's vehicle weight and external amount */}
                <div className="flex justify-center items-center">
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">Weight by Company:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} kg`,
                            data: externalThisMonthVehicleWeight,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={cheerfulFiestaPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <p className="text-2xl font-bold dark:text-white">External Amount by Company:</p>
                      <br/>
                      <PieChart
                        series={[
                          {
                            arcLabel: (item) => `${item.value} `,
                            data: externalThisMonthExternalAmount,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        colors={mangoFusionPalette}
                        slotProps={{
                          legend: {
                            labelStyle: { 
                              fontSize: 15,
                              fill: 'white'
                             },
                          }
                        }}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontWeight: 'bold',
                          },
                        }}
                        height={250}
                      />
                    </Grid>
                  </Grid>
                </div>

                <br/>
                <Divider sx={{bgcolor:'white'}}></Divider>
                <br/>
            </div>
            :

            <div className="flex justify-center items-center h-96">
              <CircularProgress />
            </div>
        
          }

        </div>
      </div>
      
    </div>


  );
}

export default Dashboard