
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
import Sidebar from './Sidebar';
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


const Dashboard = () => {
    const nav = useNavigate();

    const {user, isLogged,apiUrl} = useContext(UserContext);
    
    const [widgetData, setWidgetData] = useState<any>(null);

    const [todayIncoming, setTodayIncoming] = useState<any[]>([]);
    const [todayOutgoing, setTodayOutgoing] = useState<any[]>([]);
    const [thisWeekIncoming, setThisWeekIncoming] = useState<any[]>([]);
    const [thisWeekOutgoing, setThisWeekOutgoing] = useState<any[]>([]);
    const [thisMonthIncoming, setThisMonthIncoming] = useState<any[]>([]);
    const [thisMonthOutgoing, setThisMonthOutgoing] = useState<any[]>([]);


    useEffect(()=>
    {
        if(!isLogged)
        {
          nav('/');
        }

        axios.get(`${apiUrl}/goods/widgetData`, {params: {email: user?.email}})
        .then((res)=>
        {
            setWidgetData(res.data);
        })
        .catch((err)=>
        {
            console.log(err);
        
        })

    },[])


    //must first convert data inn widgetData to series data for pie chart
    const convertToPieData = (data: any) =>
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

    useEffect(()=>
    {
      if(widgetData)
      {
        // console.log(widgetData);
        convertToPieData(widgetData.data);
      }
    
    },[widgetData])



  return (
    <div className='flex flex-row w-full overflow-hidden dark:bg-gray-800 dark:text-white'>
      <Sidebar />
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
            widgetData ? 
            <div>
              
            
              {/* DISPLAY MAIN STUFF IN CARD FORM */}
              <br/>

              {/* First todays data. Which includes the cards for number of today incomming goods, outgoing goods, total goodsd weight */}
              {/* then a pie chart for today_goods_weight using material ui pie chart*/}
              {/* make use of sample code for pie chart */}

              <h4 className="text-2xl font-bold underline dark:text-white">Todays's Data:</h4>

              <br/>
              <Grid sx={{ flexGrow: 1 }} container spacing={5}>
                  <Grid item xs={12}>
                    {/* make width of each grid item larger */}
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
                                {widgetData.data.today.incoming}
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
                              {widgetData.data.today.outgoing}
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
                      {/* provide a title */}
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
                      {/* provide a title */}
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
                              {widgetData.data.this_week.incoming}
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
                              {widgetData.data.this_week.outgoing}
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
                      {/* provide a title */}
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
                      {/* provide a title */}
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
                              {widgetData.data.this_month.incoming}
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
                              {widgetData.data.this_month.outgoing}
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
                      {/* provide a title */}
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
                      {/* provide a title */}
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