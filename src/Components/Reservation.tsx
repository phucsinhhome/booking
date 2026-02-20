import React, { useState, useEffect } from "react";
import {
  Button,
  Label,
} from "flowbite-react";
import { addDays, formatLocaleDate, formatSimpleDateTime, formatVND } from "../Service/Utils";
import { FaCheck } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { ResRoom } from "./Booking";
import { getReservation } from "../db/reservation";

export type ReservationR = {
  id?: string;
  code: string;
  guestName: string | null;
  phone?: string;
  email?: string;
  note?: string;
  country: string;
  channel: string;
  numOfGuest: number;
  canceled: false;
  checkInDate: string;
  checkOutDate: string;
  rooms: ResRoom[];
  guestIds: [];
  guestPhotos: [];
};

export type Reservation = {
  id?: string;
  code: string;
  guestName: string | null;
  phone?: string,
  email?: string,
  note?: string;
  country: string;
  channel: string;
  numOfGuest: number;
  canceled: false;
  checkInDate: Date;
  checkOutDate: Date;
  rooms: ResRoom[];
  guestIds: [];
  guestPhotos: [];
};

const defaultReservation: Reservation = {
  id: undefined,
  code: '',
  guestName: null,
  phone: "",
  email: "",
  note: "",
  country: "VN",
  channel: "PSBOOKING",
  numOfGuest: 2,
  canceled: false,
  checkInDate: new Date(new Date().setHours(14, 0, 0, 0)),
  checkOutDate: addDays(new Date(new Date().setHours(12, 0, 0, 0)), 1),
  rooms: [],
  guestIds: [],
  guestPhotos: [],
};

type ReservationProps = {
  activeMenu: any;
};

export const Reservation = (props: ReservationProps) => {
  const [reservation, setReservation] = useState<Reservation>(defaultReservation);

  const { reservationId } = useParams();
  const navigate = useNavigate();
  
  const fetchReservation = async () => {
    try {
      if (!reservationId) {
        console.warn("Reservation id is not provided");
        return;
      }
      console.info("Fetching reservation with id %s", reservationId);
      const rsp = await getReservation(reservationId);
      const b = rsp.data as ReservationR;
      if (b) {
        setReservation({
          ...b,
          checkInDate: new Date(`${b.checkInDate}Z`),
          checkOutDate: new Date(`${b.checkOutDate}Z`),
        });
      }
    } catch (error) {
      console.error("Failed to fetch reservation: ", error);
    }
  };

  useEffect(() => {
    props.activeMenu();
    if (reservationId) {
      fetchReservation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-row">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">
            {reservation?.guestName}
          </h2>
        </div>
        <div className="flex flex-row">
          <Label htmlFor="email" value="Email:" />
          <span className="ml-2">{reservation.email}</span>
        </div>
        <div className="flex flex-row">
          <Label htmlFor="phone" value="Phone:" />
          <span className="ml-2">{reservation.phone}</span>
        </div>
        <div className="flex flex-row">
          <Label htmlFor="checkIn" value="Check In:" />
          <span className="ml-2">{formatSimpleDateTime(reservation.checkInDate)}</span>
        </div>
        <div className="flex flex-row">
          <Label htmlFor="checkOut" value="Check Out:" />
          <span className="ml-2">{formatSimpleDateTime(reservation.checkOutDate)}</span>
        </div>
        <div className="flex flex-row">
          <Label htmlFor="numOfGuest" value="Number of Guests:" />
          <span className="ml-2">{reservation.numOfGuest}</span>
        </div>
        <div className="flex flex-col">
          {
            reservation.rooms?.map((r) => (
              <div key={r.roomName} className="flex flex-col">
                <div><span className="font-semibold">{r.roomName}</span></div>
                <div className="flex flex-row text-xs space-x-3">
                  <span className="ml-2">{formatVND(r.totalPrice)}</span>
                </div>
              </div>
            ))
          }
          </div>
        <div className="text-center pt-3">
          <span className="italic">Create reservation successfully</span>
        </div>
      </div>
      <div className="absolute bottom-1 left-1/2 flex w-11/12 -translate-x-1/2 flex-row items-center justify-center space-x-2 rounded-3xl bg-slate-300 opacity-70 shadow-sm">
        <Button size="xs" color="green" onClick={() => navigate("/booking")}>
          <FaCheck size="1.5em" className="mr-2" />
          OK
        </Button>
      </div>
    </>
  );
}
