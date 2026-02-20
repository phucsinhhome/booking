import React, { useState, useEffect } from "react";
import {
  Button,
  Datepicker,
  Label,
  Select,
} from "flowbite-react";
import { addDays, formatISODateTime, formatLocaleDate } from "../Service/Utils";
import { FaCheck } from "react-icons/fa";
import CounterInput from "./CounterInput";
import { startBooking } from "../db/booking";
import { redirect } from "react-router-dom";

export type BookingR = {
  id: string | null;
  code: string | null;
  guestName: string | null;
  phone?: string;
  email?: string;
  note?: string;
  country: string;
  channel: string;
  numOfAdult: number;
  numOfChild: number;
  canceled: false;
  checkIn: string;
  checkOut: string;
  rooms: ResRoom[];
  guestIds: [];
  guestPhotos: [];
};

export type Booking = {
  id: string | null;
  code: string | null;
  guestName: string | null;
  phone?: string,
  email?: string,
  note?: string;
  country: string;
  channel: string;
  numOfAdult: number;
  numOfChild: number;
  canceled: false;
  checkIn: Date;
  checkOut: Date;
  rooms: ResRoom[];
  guestIds: [];
  guestPhotos: [];
};

export type Availability = {
  id: string | null;
  from: Date;
  to: Date;
  roomId: string;
  ratePlanId: string;
  price: number;
};

const defaultBooking: Booking = {
  id: null,
  code: null,
  guestName: null,
  phone: "",
  email: "",
  note: "",
  country: "VN",
  channel: "PSBOOKING",
  numOfAdult: 2,
  numOfChild: 0,
  canceled: false,
  checkIn: new Date(new Date().setHours(14, 0, 0, 0)),
  checkOut: addDays(new Date(new Date().setHours(12, 0, 0, 0)), 1),
  rooms: [],
  guestIds: [],
  guestPhotos: [],
};

export const hours = Array.from(Array(24).keys()).map((h) => ({
  label: `${h}:00`,
  value: h,
}));

export type ResRoom = {
  roomName: string;
  internalRoomName: string;
  totalPrice: number;
};

export type Pagination = {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
};

type BookingProps = {
  activeMenu: any;
};

export function Booking(props: BookingProps) {
  const [booking, setBooking] = useState<Booking>(defaultBooking);

  const startBookingSession = async () => {
    try {
      if (booking.id !== null) {
        console.warn("Booking id provided, skip starting booking and fetching details for id %s", booking.id);
        return;
      }
      console.info("Starting booking session with checkIn %s, checkOut %s, numOfAdult %s and numOfChild %s", booking.checkIn, booking.checkOut, booking.numOfAdult, booking.numOfChild);
      const rsp = await startBooking(booking.checkIn, booking.checkOut, booking.numOfAdult, booking.numOfChild);
      const b = rsp.data as BookingR;
      if (b) {
        setBooking({
          ...b,
          checkIn: new Date(`${b.checkIn}Z`),
          checkOut: new Date(`${b.checkOut}Z`),
        });
        if (b.id) {
          console.info("Booking session started successfully, redirecting to booking details page with id %s", b.id);
          window.location.href = `/booking/${b.id}`;
        }
      }
    } catch (error) {
      console.error("Failed to start booking session: ", error);
    }
  };

  useEffect(() => {
    props.activeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;

    setBooking({
      ...booking,
      [id]: value,
    });
  };

  const handleDateChange = (date: Date, id: string) => {
    console.info("Date input change detected: %s and %s", date, id);
    let eD = booking[id as keyof Booking] as Date;
    console.info("Current date value: %s", formatLocaleDate(eD));
    let nD = new Date(date);

    nD.setHours(eD.getHours());
    nD.setMinutes(0);
    nD.setSeconds(0);
    nD.setMilliseconds(0);
    setBooking({
      ...booking,
      [id]: nD,
    });
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = event.target;
    let eD = booking[id as keyof Booking] as Date;
    let nD = new Date(eD);
    nD.setHours(Number(value));
    setBooking({
      ...booking,
      [id]: nD,
    });
  };

  const emptyTextInput = (fieldName: string) => {
    setBooking({
      ...booking,
      [fieldName]: "",
    });
  };

  const changeCounter = (fieldName: string, value: number) => {
    setBooking({
      ...booking,
      [fieldName]: value,
    });
  };

  return (
    <>
      <div className="w-full space-y-2">
        <div className="flex w-full flex-col align-middle">
          <div className="flex w-3/5 items-center">
            <Label htmlFor="checkIn" value="Check In" />
          </div>

          <div className="flex w-full flex-row">
            <Datepicker
              id="checkIn"
              required={true}
              type="date"
              value={formatLocaleDate(booking?.checkIn)}
              onSelectedDateChanged={(date) =>
                handleDateChange(date, "checkIn")
              }
            />
            <Select
              id="checkIn"
              required={true}
              className="ml-2"
              value={booking?.checkIn.getHours()}
              onChange={handleSelectChange}
            >
              {hours.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex w-full flex-col align-middle">
          <div className="flex w-3/5 items-center">
            <Label htmlFor="checkOut" value="Check Out" />
          </div>

          <div className="flex w-full flex-row">
            <Datepicker
              id="checkOut"
              required={true}
              type="date"
              value={formatLocaleDate(booking?.checkOut)}
              onSelectedDateChanged={(date) =>
                handleDateChange(date, "checkOut")
              }
            />
            <Select
              id="checkOut"
              required={true}
              className="ml-2"
              value={booking?.checkOut.getHours()}
              onChange={handleSelectChange}
            >
              {hours.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex w-full flex-col align-middle">
          <div className="flex w-3/5 items-center">
            <Label htmlFor="numOfAdult" value="Number of Adults" />
          </div>
          <CounterInput<Booking>
            name="numOfAdult"
            value={booking?.numOfAdult || 0}
            onChange={changeCounter}
            min={1}
            step={1}
          />
        </div>
      </div>
      <div className="absolute bottom-1 left-1/2 flex w-11/12 -translate-x-1/2 flex-row items-center justify-center space-x-2 rounded-3xl bg-slate-300 opacity-70 shadow-sm">
        <Button size="xs" color="green" onClick={startBookingSession}>
          <FaCheck size="1.5em" className="mr-2" />
          Check availability
        </Button>
      </div>
    </>
  );
}
