import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Flight, Booking, Company, Banner, GalleryImage } from '../types';
import { mockUsers, mockFlights, mockBookings, mockCompanies, mockBanners, mockGallery } from '../mockData';

interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (email: string, password: string, name: string) => boolean;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  blockUser: (id: string) => void;
  unblockUser: (id: string) => void;
  
  // Flights
  flights: Flight[];
  addFlight: (flight: Omit<Flight, 'id'>) => void;
  updateFlight: (id: string, updates: Partial<Flight>) => void;
  deleteFlight: (id: string) => void;
  
  // Bookings
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'confirmationId' | 'bookingDate' | 'status'>) => string;
  cancelBooking: (id: string) => void;
  
  // Companies
  companies: Company[];
  addCompany: (company: Omit<Company, 'id'>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  
  // Banners
  banners: Banner[];
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  updateBanner: (id: string, updates: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  
  // Gallery
  gallery: GalleryImage[];
  addGalleryImage: (image: Omit<GalleryImage, 'id'>) => void;
  deleteGalleryImage: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [flights, setFlights] = useState<Flight[]>(mockFlights);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [banners, setBanners] = useState<Banner[]>(mockBanners);
  const [gallery, setGallery] = useState<GalleryImage[]>(mockGallery);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('osh-user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem('osh-user');
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user && !user.blocked) {
      setCurrentUser(user);
      localStorage.setItem('osh-user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('osh-user');
  };

  const register = (email: string, password: string, name: string): boolean => {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) return false;

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role: 'user',
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem('osh-user', JSON.stringify(newUser));
    return true;
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: `user-${Date.now()}` };
    setUsers([...users, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const blockUser = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, blocked: true } : u));
  };

  const unblockUser = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, blocked: false } : u));
  };

  const addFlight = (flight: Omit<Flight, 'id'>) => {
    const newFlight = { ...flight, id: `flight-${Date.now()}` };
    setFlights([...flights, newFlight]);
  };

  const updateFlight = (id: string, updates: Partial<Flight>) => {
    setFlights(flights.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteFlight = (id: string) => {
    setFlights(flights.filter(f => f.id !== id));
  };

  const addBooking = (booking: Omit<Booking, 'id' | 'confirmationId' | 'bookingDate' | 'status'>): string => {
    const confirmationId = `OSH-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newBooking: Booking = {
      ...booking,
      id: `booking-${Date.now()}`,
      confirmationId,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
    };

    // Update flight seats
    const flight = flights.find(f => f.id === booking.flightId);
    if (flight) {
      const seatClass = booking.seatClass;
      updateFlight(booking.flightId, {
        seats: {
          ...flight.seats,
          [seatClass]: {
            ...flight.seats[seatClass],
            available: flight.seats[seatClass].available - 1,
          },
        },
      });
    }

    setBookings([...bookings, newBooking]);
    return confirmationId;
  };

  const cancelBooking = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    const flight = flights.find(f => f.id === booking.flightId);
    if (flight) {
      const departureDate = new Date(flight.departureDate);
      const now = new Date();
      const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      const newStatus = hoursUntilDeparture > 24 ? 'refunded' : 'cancelled';
      
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));

      // Return seat to inventory
      const seatClass = booking.seatClass;
      updateFlight(booking.flightId, {
        seats: {
          ...flight.seats,
          [seatClass]: {
            ...flight.seats[seatClass],
            available: flight.seats[seatClass].available + 1,
          },
        },
      });
    }
  };

  const addCompany = (company: Omit<Company, 'id'>) => {
    const newCompany = { ...company, id: `comp-${Date.now()}` };
    setCompanies([...companies, newCompany]);
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCompany = (id: string) => {
    setCompanies(companies.filter(c => c.id !== id));
  };

  const addBanner = (banner: Omit<Banner, 'id'>) => {
    const newBanner = { ...banner, id: `banner-${Date.now()}` };
    setBanners([...banners, newBanner]);
  };

  const updateBanner = (id: string, updates: Partial<Banner>) => {
    setBanners(banners.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBanner = (id: string) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  const addGalleryImage = (image: Omit<GalleryImage, 'id'>) => {
    const newImage = { ...image, id: `gallery-${Date.now()}` };
    setGallery([...gallery, newImage]);
  };

  const deleteGalleryImage = (id: string) => {
    setGallery(gallery.filter(g => g.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        register,
        users,
        addUser,
        updateUser,
        deleteUser,
        blockUser,
        unblockUser,
        flights,
        addFlight,
        updateFlight,
        deleteFlight,
        bookings,
        addBooking,
        cancelBooking,
        companies,
        addCompany,
        updateCompany,
        deleteCompany,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        gallery,
        addGalleryImage,
        deleteGalleryImage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
