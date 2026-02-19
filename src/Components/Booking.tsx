import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Datepicker,
  Label,
  Select,
} from "flowbite-react";
import { addDays, formatLocaleDate } from "../Service/Utils";
import { DEFAULT_PAGE_SIZE } from "../App";
import { FaCheck } from "react-icons/fa";
import CounterInput from "./CounterInput";
import { filterBooking, getBooking, startBooking } from "../db/booking";

export type BookingR = {
  id: string | null;
  code: string | null;
  guestName: string | null;
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
  country: "VN",
  channel: "PSBOOKING",
  numOfAdult: 2,
  numOfChild: 0,
  canceled: false,
  checkIn: new Date(),
  checkOut: addDays(new Date(), 1),
  rooms: [],
  guestIds: [],
  guestPhotos: [],
};

const hours = Array.from(Array(24).keys()).map((h) => ({
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
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [choices, setChoices] = useState<Availability[]>([]);

  const [fromDate, setFromDate] = useState(new Date());
  const [deltaDays, setDeltaDays] = useState(0);

  const [pagination, setPagination] = useState<Pagination>({
    pageNumber: 0,
    pageSize: Number(DEFAULT_PAGE_SIZE),
    totalElements: 200,
    totalPages: 20,
  });

  const { bookingId } = useParams();

  const startBookingSession = async () => {
    try {
      if (bookingId !== undefined && bookingId !== null) {
        console.warn("Booking id provided, skip starting booking and fetching details for id %s", bookingId);
        return;
      }
      console.info("Starting booking session with checkIn %s, checkOut %s, numOfAdult %s and numOfChild %s", booking.checkIn, booking.checkOut, booking.numOfAdult, booking.numOfChild);
      const rsp = await startBooking(booking.checkIn, booking.checkOut, booking.numOfAdult, booking.numOfChild);
      const b = rsp.data as BookingR;
      if (b) {
        setBooking({
          ...b,
          checkIn: new Date(b.checkIn),
          checkOut: new Date(b.checkOut),
        });
        fetchAvailabilities(b.id as string);
      }
    } catch (error) {
      console.error("Failed to start booking session: ", error);
    }
  };

  const fetchBooking = async () => {
    try {
      if (bookingId === undefined) {
        console.warn("No booking id provided, skip fetching booking details.");
        return;
      }
      console.info("Fetching booking details for id %s", bookingId);
      const rsp = await getBooking(bookingId);
      const b = rsp.data as BookingR;
      if (b) {
        setBooking({
          ...b,
          checkIn: new Date(b.checkIn),
          checkOut: new Date(b.checkOut),
        });
      }
    } catch (error) {
      console.error("Failed to fetch booking: ", error);
    }
  };

  const fetchAvailabilities = async (createdBookingId: string) => {
    try {
      if (createdBookingId === undefined) {
        console.warn("No booking id provided, skip fetching booking details.");
        return;
      }
      console.info("Fetching booking details for id %s", createdBookingId);
      let filters = {
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        numOfAdult: booking.numOfAdult,
        numOfChild: booking.numOfChild,
      };
      const rsp = await filterBooking(createdBookingId, filters);
      if (rsp.data) {
        setAvailabilities(rsp.data.availabilities as Availability[]);
        setChoices(rsp.data.choices as Availability[]);
      }
    } catch (error) {
      console.error("Failed to fetch booking: ", error);
    }
  };

  useEffect(() => {
    if (bookingId === undefined) {
      console.warn("No booking id provided, skip fetching booking details.");
      return;
    }
    fetchBooking();
    props.activeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  const filterOpts = [
    {
      days: 0,
      label: "Today",
    },
    {
      days: -1,
      label: "Yesterday",
    },
    {
      days: -5,
      label: "5 days",
    },
    {
      days: -1 * new Date().getDate(),
      label: "1st",
    },
  ];

  const pageClass = (pageNum: number) => {
    var noHighlight =
      "px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";
    var highlight =
      "px-3 py-2 leading-tight text-bold text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white";

    return pagination.pageNumber === pageNum ? highlight : noHighlight;
  };

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
