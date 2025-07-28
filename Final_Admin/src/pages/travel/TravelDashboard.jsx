import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Flight,
  Train,
  DirectionsBus,
  Edit,
  Delete,
  Add,
  Visibility
} from '@mui/icons-material';
import axios from 'axios';

const TravelDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState({
    flights: [],
    trains: [],
    buses: [],
    destinations: [],
    bookings: []
  });
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogType, setDialogType] = useState(''); // 'add', 'edit', 'view'

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoints = [
        '/api/flights',
        '/api/trains', 
        '/api/buses',
        '/api/destinations',
        '/api/travel-bookings'
      ];
      
      const responses = await Promise.all(
        endpoints.map(endpoint => 
          axios.get(endpoint).catch(err => ({ data: [] }))
        )
      );

      setData({
        flights: responses[0].data.flights || [],
        trains: responses[1].data.trains || [],
        buses: responses[2].data.buses || [],
        destinations: responses[3].data.destinations || [],
        bookings: responses[4].data.bookings || []
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAdd = (type) => {
    setDialogType('add');
    setSelectedItem(null);
    setOpenDialog(true);
  };

  const handleEdit = (item, type) => {
    setDialogType('edit');
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleView = (item, type) => {
    setDialogType('view');
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const endpoint = type === 'destination' ? '/api/destinations' : `/api/${type}s`;
        await axios.delete(`${endpoint}/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const renderStatsCards = () => {
    const stats = [
      {
        title: 'Total Flights',
        value: data.flights.length,
        icon: <Flight sx={{ fontSize: 40, color: '#1976d2' }} />,
        color: '#e3f2fd'
      },
      {
        title: 'Total Trains',
        value: data.trains.length,
        icon: <Train sx={{ fontSize: 40, color: '#388e3c' }} />,
        color: '#e8f5e8'
      },
      {
        title: 'Total Buses',
        value: data.buses.length,
        icon: <DirectionsBus sx={{ fontSize: 40, color: '#f57c00' }} />,
        color: '#fff3e0'
      },
      {
        title: 'Total Bookings',
        value: data.bookings.length,
        icon: <Visibility sx={{ fontSize: 40, color: '#7b1fa2' }} />,
        color: '#f3e5f5'
      }
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ bgcolor: stat.color }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderFlightsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Flight Number</TableCell>
            <TableCell>Airline</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Schedule</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.flights.map((flight) => (
            <TableRow key={flight._id}>
              <TableCell>{flight.flightNumber}</TableCell>
              <TableCell>{flight.airline.name}</TableCell>
              <TableCell>
                {flight.route.origin?.code} → {flight.route.destination?.code}
              </TableCell>
              <TableCell>
                {flight.schedule.departureTime} - {flight.schedule.arrivalTime}
              </TableCell>
              <TableCell>
                <Chip 
                  label={flight.status} 
                  color={getStatusColor(flight.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleView(flight, 'flight')}>
                  <Visibility />
                </IconButton>
                <IconButton onClick={() => handleEdit(flight, 'flight')}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(flight._id, 'flight')}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderTrainsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Train Number</TableCell>
            <TableCell>Train Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Schedule</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.trains.map((train) => (
            <TableRow key={train._id}>
              <TableCell>{train.trainNumber}</TableCell>
              <TableCell>{train.trainName}</TableCell>
              <TableCell>
                <Chip label={train.trainType} size="small" />
              </TableCell>
              <TableCell>
                {train.route.origin?.code} → {train.route.destination?.code}
              </TableCell>
              <TableCell>
                {train.schedule.departureTime} - {train.schedule.arrivalTime}
              </TableCell>
              <TableCell>
                <Chip 
                  label={train.status} 
                  color={getStatusColor(train.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleView(train, 'train')}>
                  <Visibility />
                </IconButton>
                <IconButton onClick={() => handleEdit(train, 'train')}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(train._id, 'train')}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderBusesTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bus Number</TableCell>
            <TableCell>Operator</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Schedule</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.buses.map((bus) => (
            <TableRow key={bus._id}>
              <TableCell>{bus.busNumber}</TableCell>
              <TableCell>{bus.operator.name}</TableCell>
              <TableCell>
                <Chip label={bus.busType.replace('_', ' ')} size="small" />
              </TableCell>
              <TableCell>
                {bus.route.origin?.name} → {bus.route.destination?.name}
              </TableCell>
              <TableCell>
                {bus.schedule.departureTime} - {bus.schedule.arrivalTime}
              </TableCell>
              <TableCell>
                <Chip 
                  label={bus.status} 
                  color={getStatusColor(bus.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleView(bus, 'bus')}>
                  <Visibility />
                </IconButton>
                <IconButton onClick={() => handleEdit(bus, 'bus')}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(bus._id, 'bus')}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderBookingsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Booking ID</TableCell>
            <TableCell>Travel Type</TableCell>
            <TableCell>Passenger</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.bookings.map((booking) => (
            <TableRow key={booking._id}>
              <TableCell>{booking.bookingId}</TableCell>
              <TableCell>
                <Chip label={booking.travelType} size="small" />
              </TableCell>
              <TableCell>
                {booking.userId?.firstName} {booking.userId?.lastName}
              </TableCell>
              <TableCell>
                {booking.journey.origin?.code} → {booking.journey.destination?.code}
              </TableCell>
              <TableCell>
                {new Date(booking.journey.departureDate).toLocaleDateString()}
              </TableCell>
              <TableCell>₹{booking.pricing.totalAmount.toLocaleString()}</TableCell>
              <TableCell>
                <Chip 
                  label={booking.status} 
                  color={getStatusColor(booking.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleView(booking, 'booking')}>
                  <Visibility />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const tabContent = [
    { label: 'Flights', content: renderFlightsTable() },
    { label: 'Trains', content: renderTrainsTable() },
    { label: 'Buses', content: renderBusesTable() },
    { label: 'Bookings', content: renderBookingsTable() }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Travel Management Dashboard
      </Typography>

      {renderStatsCards()}

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              {tabContent.map((tab, index) => (
                <Tab key={index} label={tab.label} />
              ))}
            </Tabs>
            
            {activeTab < 3 && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleAdd(tabContent[activeTab].label.toLowerCase().slice(0, -1))}
              >
                Add {tabContent[activeTab].label.slice(0, -1)}
              </Button>
            )}
          </Box>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            tabContent[activeTab].content
          )}
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit/View */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'add' ? 'Add New' : dialogType === 'edit' ? 'Edit' : 'View'} Item
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {dialogType !== 'view' && (
            <Button variant="contained">Save</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TravelDashboard;
