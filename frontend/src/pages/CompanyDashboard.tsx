import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Plus, Edit, Trash2, Users, TrendingUp, Calendar } from 'lucide-react';
import { useApp } from '../lib/context/AppContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { cities } from '../lib/mockData';
import { Loading } from '../components/ui/loading';

export function CompanyDashboard() {
  const navigate = useNavigate();
  const { success, error, warning } = useToast();
  const { currentUser, flights, bookings, companies, addFlight, updateFlight, deleteFlight, updateUser } = useApp();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<{
    id: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureDate: string;
    arrivalDate: string;
    price: { economy: number; comfort: number; business: number };
    seats: { economy: { total: number }; comfort: { total: number }; business: { total: number } };
  } | null>(null);
  const [statsFilter, setStatsFilter] = useState('all');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [flightNumber, setFlightNumber] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [economyPrice, setEconomyPrice] = useState('');
  const [comfortPrice, setComfortPrice] = useState('');
  const [businessPrice, setBusinessPrice] = useState('');
  const [economySeats, setEconomySeats] = useState('');
  const [comfortSeats, setComfortSeats] = useState('');
  const [businessSeats, setBusinessSeats] = useState('');

  if (!currentUser || currentUser.role !== 'company') {
    navigate('/login');
    return null;
  }

  const company = companies.find(c => c.id === currentUser.companyId);
  const companyFlights = flights.filter(f => f.companyId === currentUser.companyId);

  const resetForm = () => {
    setFlightNumber('');
    setOrigin('');
    setDestination('');
    setDepartureDate('');
    setArrivalDate('');
    setEconomyPrice('');
    setComfortPrice('');
    setBusinessPrice('');
    setEconomySeats('');
    setComfortSeats('');
    setBusinessSeats('');
    setEditingFlight(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Validation: Check if all required fields are filled
    if (!flightNumber.trim()) {
      error('Please enter a flight number');
      setIsLoading(false);
      return;
    }
    if (!origin.trim()) {
      error('Please select an origin');
      setIsLoading(false);
      return;
    }
    if (!destination.trim()) {
      error('Please select a destination');
      setIsLoading(false);
      return;
    }
    if (origin.trim() === destination.trim()) {
      error('Origin and destination cannot be the same');
      setIsLoading(false);
      return;
    }
    if (!departureDate) {
      error('Please select a departure date and time');
      setIsLoading(false);
      return;
    }
    if (!arrivalDate) {
      error('Please select an arrival date and time');
      setIsLoading(false);
      return;
    }
    // Check that at least one seat class has both price and seats
    const hasEconomy = economyPrice && parseFloat(economyPrice) > 0 && economySeats && parseInt(economySeats) > 0;
    const hasComfort = comfortPrice && parseFloat(comfortPrice) > 0 && comfortSeats && parseInt(comfortSeats) > 0;
    const hasBusiness = businessPrice && parseFloat(businessPrice) > 0 && businessSeats && parseInt(businessSeats) > 0;
    
    if (!hasEconomy && !hasComfort && !hasBusiness) {
      error('Please configure at least one seat class with both pricing and capacity');
      setIsLoading(false);
      return;
    }
    
    // Validate individual seat classes if they have data
    if (economyPrice && (!economySeats || parseInt(economySeats) <= 0)) {
      error('Please enter a valid economy seat count');
      setIsLoading(false);
      return;
    }
    if (economySeats && (!economyPrice || parseFloat(economyPrice) <= 0)) {
      error('Please enter a valid economy price');
      setIsLoading(false);
      return;
    }
    if (comfortPrice && (!comfortSeats || parseInt(comfortSeats) <= 0)) {
      error('Please enter a valid comfort seat count');
      setIsLoading(false);
      return;
    }
    if (comfortSeats && (!comfortPrice || parseFloat(comfortPrice) <= 0)) {
      error('Please enter a valid comfort price');
      setIsLoading(false);
      return;
    }
    if (businessPrice && (!businessSeats || parseInt(businessSeats) <= 0)) {
      error('Please enter a valid business seat count');
      setIsLoading(false);
      return;
    }
    if (businessSeats && (!businessPrice || parseFloat(businessPrice) <= 0)) {
      error('Please enter a valid business price');
      setIsLoading(false);
      return;
    }

    // Validate dates
    const departure = new Date(departureDate);
    const arrival = new Date(arrivalDate);
    
    if (isNaN(departure.getTime())) {
      error('Please enter a valid departure date');
      setIsLoading(false);
      return;
    }
    if (isNaN(arrival.getTime())) {
      error('Please enter a valid arrival date');
      setIsLoading(false);
      return;
    }
    if (arrival <= departure) {
      error('Arrival time must be after departure time');
      setIsLoading(false);
      return;
    }

    const durationMs = arrival.getTime() - departure.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours}h ${minutes}m`;

    const flightData = {
      companyId: currentUser.companyId!,
      flightNumber: flightNumber.trim(),
      origin: origin.trim(),
      destination: destination.trim(),
      departureDate,
      arrivalDate,
      duration,
      price: {
        economy: hasEconomy ? parseFloat(economyPrice) : 0,
        comfort: hasComfort ? parseFloat(comfortPrice) : 0,
        business: hasBusiness ? parseFloat(businessPrice) : 0,
      },
      seats: {
        economy: { 
          total: hasEconomy ? parseInt(economySeats) : 0, 
          available: hasEconomy ? parseInt(economySeats) : 0 
        },
        comfort: { 
          total: hasComfort ? parseInt(comfortSeats) : 0, 
          available: hasComfort ? parseInt(comfortSeats) : 0 
        },
        business: { 
          total: hasBusiness ? parseInt(businessSeats) : 0, 
          available: hasBusiness ? parseInt(businessSeats) : 0 
        },
      },
      status: 'upcoming' as const,
    };

    if (editingFlight) {
      updateFlight(editingFlight.id, flightData);
    } else {
      addFlight(flightData);
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    resetForm();
    setIsDialogOpen(false);
    success(editingFlight ? 'Flight updated successfully' : 'Flight created successfully');
    setIsLoading(false);
  };

  const handleEdit = (flight: {
    id: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureDate: string;
    arrivalDate: string;
    price: { economy: number; comfort: number; business: number };
    seats: { economy: { total: number }; comfort: { total: number }; business: { total: number } };
  }) => {
    setEditingFlight(flight);
    setFlightNumber(flight.flightNumber);
    setOrigin(flight.origin);
    setDestination(flight.destination);
    setDepartureDate(flight.departureDate.split('T')[0] + 'T' + flight.departureDate.split('T')[1].substring(0, 5));
    setArrivalDate(flight.arrivalDate.split('T')[0] + 'T' + flight.arrivalDate.split('T')[1].substring(0, 5));
    setEconomyPrice(flight.price.economy.toString());
    setComfortPrice(flight.price.comfort.toString());
    setBusinessPrice(flight.price.business.toString());
    setEconomySeats(flight.seats.economy.total.toString());
    setComfortSeats(flight.seats.comfort.total.toString());
    setBusinessSeats(flight.seats.business.total.toString());
    setIsDialogOpen(true);
  };

  const handleDelete = (flightId: string) => {
    if (confirm('Are you sure you want to delete this flight?')) {
      deleteFlight(flightId);
      success('Flight deleted successfully');
    }
  };

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      error('Please fill in all password fields');
      return;
    }
    if (currentPassword !== currentUser.password) {
      error('Current password is incorrect');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters long');
      return;
    }

    updateUser(currentUser.id, { password: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(false);
    success('Password changed successfully');
  };

  // Get passengers for company flights
  const companyPassengers = useMemo(() => {
    const flightIds = companyFlights.map(f => f.id);
    return bookings.filter(b => flightIds.includes(b.flightId) && b.status === 'confirmed');
  }, [companyFlights, bookings]);

  // Statistics
  const stats = useMemo(() => {
    let relevantFlights = companyFlights;
    let relevantBookings = companyPassengers;

    const now = new Date();
    if (statsFilter !== 'all') {
      const filterDate = new Date();
      if (statsFilter === 'today') {
        filterDate.setHours(0, 0, 0, 0);
      } else if (statsFilter === 'week') {
        filterDate.setDate(filterDate.getDate() - 7);
      } else if (statsFilter === 'month') {
        filterDate.setMonth(filterDate.getMonth() - 1);
      }

      relevantBookings = relevantBookings.filter(b => new Date(b.bookingDate) >= filterDate);
    }

    const totalFlights = relevantFlights.length;
    const upcomingFlights = relevantFlights.filter(f => f.status === 'upcoming' && new Date(f.departureDate) > now).length;
    const completedFlights = relevantFlights.filter(f => f.status === 'completed' || new Date(f.departureDate) < now).length;
    const totalPassengers = relevantBookings.length;
    const totalRevenue = relevantBookings.reduce((sum, b) => sum + b.price, 0);

    return { totalFlights, upcomingFlights, completedFlights, totalPassengers, totalRevenue };
  }, [companyFlights, companyPassengers, statsFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2">Company Dashboard</h1>
        <p className="text-muted-foreground">{company?.name}</p>
      </div>

      <Tabs defaultValue="flights">
        <TabsList>
          <TabsTrigger value="flights">Flights</TabsTrigger>
          <TabsTrigger value="passengers">Passengers</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Flights Tab */}
        <TabsContent value="flights" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>Manage Flights</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Flight
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingFlight ? 'Edit Flight' : 'Add New Flight'}</DialogTitle>
                  <DialogDescription>
                    {editingFlight ? 'Update flight information' : 'Create a new flight for your airline'}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Flight Number</Label>
                    <Input 
                      value={flightNumber} 
                      onChange={(e) => setFlightNumber(e.target.value)} 
                      placeholder="OSH101" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Origin</Label>
                    <Select value={origin} onValueChange={setOrigin}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select origin" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Departure Date & Time</Label>
                    <Input type="datetime-local" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Arrival Date & Time</Label>
                    <Input type="datetime-local" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
                  </div>

                  <div className="col-span-2 pt-4">
                    <h4 className="mb-4">Pricing</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Economy ($)</Label>
                        <Input 
                          type="number" 
                          value={economyPrice} 
                          onChange={(e) => setEconomyPrice(e.target.value)} 
                          min="1" 
                          step="0.01" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Comfort ($)</Label>
                        <Input 
                          type="number" 
                          value={comfortPrice} 
                          onChange={(e) => setComfortPrice(e.target.value)} 
                          min="0" 
                          step="0.01" 
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Business ($)</Label>
                        <Input 
                          type="number" 
                          value={businessPrice} 
                          onChange={(e) => setBusinessPrice(e.target.value)} 
                          min="0" 
                          step="0.01" 
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <h4 className="mb-4">Seat Capacity</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Economy Seats</Label>
                        <Input 
                          type="number" 
                          value={economySeats} 
                          onChange={(e) => setEconomySeats(e.target.value)} 
                          min="1" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Comfort Seats</Label>
                        <Input 
                          type="number" 
                          value={comfortSeats} 
                          onChange={(e) => setComfortSeats(e.target.value)} 
                          min="0" 
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Business Seats</Label>
                        <Input 
                          type="number" 
                          value={businessSeats} 
                          onChange={(e) => setBusinessSeats(e.target.value)} 
                          min="0" 
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => { resetForm(); setIsDialogOpen(false); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loading size="sm" className="mr-2" />
                        {editingFlight ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingFlight ? 'Update Flight' : 'Create Flight'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flight</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Seats Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyFlights.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No flights yet. Create your first flight!
                      </TableCell>
                    </TableRow>
                  ) : (
                    companyFlights.map(flight => {
                      const totalAvailable = flight.seats.economy.available + flight.seats.comfort.available + flight.seats.business.available;
                      const departureDate = new Date(flight.departureDate);
                      const isValidDate = !isNaN(departureDate.getTime());
                      
                      return (
                        <TableRow key={flight.id}>
                          <TableCell>{flight.flightNumber || 'N/A'}</TableCell>
                          <TableCell>{flight.origin || 'N/A'} → {flight.destination || 'N/A'}</TableCell>
                          <TableCell>{isValidDate ? departureDate.toLocaleString() : 'Invalid Date'}</TableCell>
                          <TableCell>{isNaN(totalAvailable) ? 'N/A' : totalAvailable}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${flight.status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {flight.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(flight)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(flight.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Passengers Tab */}
        <TabsContent value="passengers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booked Passengers</CardTitle>
              <CardDescription>List of all passengers who booked your flights</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Flight</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Confirmation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyPassengers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No passengers yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    companyPassengers.map(booking => {
                      const flight = flights.find(f => f.id === booking.flightId);
                      return (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.passengerName}</TableCell>
                          <TableCell>{booking.passengerEmail}</TableCell>
                          <TableCell>{flight?.flightNumber}</TableCell>
                          <TableCell className="capitalize">{booking.seatClass}</TableCell>
                          <TableCell>${booking.price}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{booking.confirmationId}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>Company Statistics</h3>
            <Select value={statsFilter} onValueChange={setStatsFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Flights</p>
                    <p className="text-2xl">{stats.totalFlights}</p>
                  </div>
                  <Plane className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Flights</p>
                    <p className="text-2xl">{stats.upcomingFlights}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Passengers</p>
                    <p className="text-2xl">{stats.totalPassengers}</p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}