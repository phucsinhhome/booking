import { receptionApi } from "./apis";

export const getReservation = (reservationId: string) => {
  console.info("Fetching reservation from backend")
  return receptionApi.get(`/reservation/${reservationId}`);
}