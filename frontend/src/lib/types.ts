export type UserRole = 'user' | 'company' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyId?: string;
  blocked?: boolean;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  managerId: string;
  active: boolean;
}

export interface Flight {
  id: string;
  companyId: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  duration: string;
  price: {
    economy: number;
    comfort: number;
    business: number;
  };
  seats: {
    economy: { total: number; available: number };
    comfort: { total: number; available: number };
    business: { total: number; available: number };
  };
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface Booking {
  id: string;
  userId: string;
  flightId: string;
  confirmationId: string;
  passengerName: string;
  passengerEmail: string;
  seatClass: 'economy' | 'comfort' | 'business';
  price: number;
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | 'refunded';
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  duration: number; // in seconds
  active: boolean;
  type: 'promotion' | 'advertisement';
}

export interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
}