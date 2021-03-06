import { Collection, ObjectId } from 'mongodb';

/* this field will be used in our resolver functions to determine whether a user has the authorization to resolve certain fields. it's not to be stored in the database. */
export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
  contact: string;
  walletId?: string;
  income: number;
  bookings: ObjectId[];
  listings: ObjectId[];
  authorized?: boolean;
}
/* the "viewer" is to represent the "user" object that's in Mongodb and encapsulates the sensitive data,
we'll substitute the actual "walletId" with "hasWallet" when sending interacting with the client for security purposes. */
export interface Viewer {
  _id?: string;
  token?: string;
  avatar?: string;
  walletId?: string;
  didRequest: boolean;
}
interface BookingsIndexMonth {
  [key: string]: boolean;
}
interface BookingsIndexYear {
  [key: string]: BookingsIndexMonth;
}
export interface BookingsIndex {
  [key: string]: BookingsIndexYear;
}
export interface Booking {
  _id: ObjectId;
  tenant: string;
  checkIn: string;
  checkOut: string;
  listing: ObjectId;
}

export enum ListingType {
  Apartment = 'APARTMENT',
  House = 'HOUSE',
}
/* only the owner of a listing may see its bookings,
therefore we'll an "authorized" property and toggle if the viewer viewing a listing is the actual owner. */
export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: string;
  type: ListingType;
  address: string;
  country: string;
  admin: string;
  city: string;
  price: number;
  numOfGuests: number;
  bookings: ObjectId[];
  bookingsIndex: BookingsIndex;
  authroized?: boolean;
}
export interface Database {
  bookings: Collection<Booking>;
  users: Collection<User>;
  listings: Collection<Listing>;
}
