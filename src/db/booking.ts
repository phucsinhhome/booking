import { Booking } from "../Components/Booking";
import { formatISODateTime } from "../Service/Utils";
import { receptionApi } from "./apis";


export const startBooking = (checkIn: Date, checkOut: Date, numOfAdult: number, numOfChild: number) => {
  console.info("Start booking");
  return receptionApi.get(
    `/booking/start?checkIn=${formatISODateTime(checkIn)}&checkOut=${formatISODateTime(checkOut)}&numOfAdult=${numOfAdult}&numOfChild=${numOfChild}`
  );
}

export const filterBooking = (bookingId: string, filters: any) => {
  console.info("Filter booking with id %s and filters %s", bookingId, filters);
  return receptionApi.post(
    `/booking/${bookingId}/filter`,
    filters
  );
}

export const saveBooking = async (reservation: Booking) => {
  console.info("Call API to update booking");
  return receptionApi.post(
    `/booking/update`,
    reservation,
    { headers: { 'Content-Type': 'application/json' } }
  );
}

export const getBooking = async (bookingId: string) => {
  console.info("Fetching booking from backend")
  return receptionApi.get(
    `/booking/${bookingId}`
  );
}