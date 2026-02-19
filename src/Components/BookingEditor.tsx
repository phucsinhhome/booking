import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Datepicker, Label, Select } from "flowbite-react";
import { addDays, formatISODateTime, formatLocaleDate } from "../Service/Utils";
import { DEFAULT_PAGE_SIZE } from "../App";
import { FaArrowAltCircleRight, FaCheck } from "react-icons/fa";
import CounterInput from "./CounterInput";
import { filterBooking, getBooking, startBooking } from "../db/booking";
import { Availability, Booking, BookingR, Pagination } from "./Booking";
import { listRoom } from "../db/room";

export type Room = {
  id?: string;
  internalName: string;
  name: string;
  status: string;
  description?: string;
  roomTypeId?: string;
  coverImageUrl?: string;
  imageUrls?: string[];
  maxAdults?: number;
  maxChildren?: number;
  amenities?: string[];
  numSingleBeds?: number;
  numDoubleBeds?: number;
  numQueenBeds?: number;
  numHammocks?: number;
  view?: string;
  cleaningTime: string;
};

type BookingEditorProps = {
  activeMenu: any;
};

export const BookingEditor = (props: BookingEditorProps) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [choices, setChoices] = useState<Availability[]>([]);

  const [rooms, setRooms] = useState<Room[]>([]);
  const { bookingId } = useParams();

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

  const fetchRooms = async () => {
    try {
      const rsp = await listRoom(
        booking?.numOfAdult || 0,
        booking?.numOfChild || 0,
        0,
        DEFAULT_PAGE_SIZE,
      );
      if (rsp.data) {
        setRooms(rsp.data.content as Room[]);
      }
    } catch (error) {
      console.error("Failed to fetch rooms: ", error);
    }
  };

  const fetchAvailabilities = async (createdBookingId: string) => {
    try {
      if (createdBookingId === undefined) {
        console.warn("No booking id provided, skip fetching booking details.");
        return;
      }
      if (!booking) {
        console.warn(
          "No booking details available, skip fetching availabilities.",
        );
        return;
      }
      console.info("Fetching booking details for id %s", createdBookingId);
      let filters = {
        checkIn: formatISODateTime(booking.checkIn),
        checkOut: formatISODateTime(booking.checkOut),
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
    fetchRooms();
    fetchBooking();
    props.activeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  useEffect(() => {
    if (booking === null || booking.id === null) {
      console.warn("No booking id provided, skip fetching booking details.");
      return;
    }
    if (availabilities.length === 0) {
      fetchAvailabilities(booking.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    if (!booking) {
      console.warn("No booking details available, skip handling text change.");
      return;
    }
    setBooking({
      ...booking,
      [id]: value,
    });
  };

  const handleDateChange = (date: Date, id: string) => {
    if (!booking) {
      console.warn("No booking details available, skip handling date change.");
      return;
    }
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
    if (!booking) {
      console.warn(
        "No booking details available, skip handling select change.",
      );
      return;
    }
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
    if (!booking) {
      console.warn(
        "No booking details available, skip handling empty text input.",
      );
      return;
    }
    setBooking({
      ...booking,
      [fieldName]: "",
    });
  };

  const changeCounter = (fieldName: string, value: number) => {
    if (!booking) {
      console.warn(
        "No booking details available, skip handling counter change.",
      );
      return;
    }
    setBooking({
      ...booking,
      [fieldName]: value,
    });
  };

  return (
    <>
      <div className="w-full space-y-2">
        {availabilities?.map((a) => {
          let room = rooms.find((r) => r.id === a.roomId);
          return room ? (
            <div
              key={a.id}
              className="flex flex-row items-center justify-between rounded-lg bg-white p-4 shadow"
            >
              <div>
                <h3 className="text-lg font-semibold">{room?.name}</h3>
              </div>
            </div>
          ) : (
            <></>
          );
        })}
      </div>
      <div className="absolute bottom-1 left-1/2 flex w-11/12 -translate-x-1/2 flex-row items-center justify-center space-x-2 rounded-3xl bg-slate-300 opacity-70 shadow-sm">
        <Button size="xs" color="green">
          <FaArrowAltCircleRight size="1.5em" className="mr-2" />
          Next
        </Button>
      </div>
    </>
  );
};
