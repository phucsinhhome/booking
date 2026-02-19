import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Datepicker,
  Label,
  Modal,
  Select,
  Textarea,
  TextInput,
} from "flowbite-react";
import {
  addDays,
  formatISODateTime,
  formatISOHourMinute,
  formatLocaleDate,
  formatSimpleDateTime,
  formatVND,
} from "../Service/Utils";
import { DEFAULT_PAGE_SIZE } from "../App";
import {
  FaArrowAltCircleRight,
  FaArrowDown,
  FaArrowUp,
  FaBed,
  FaCheck,
  FaClock,
  FaEye,
  FaFilter,
  FaMoneyBill,
  FaTrash,
  FaXbox,
} from "react-icons/fa";
import CounterInput from "./CounterInput";
import { filterBooking, getBooking, startBooking } from "../db/booking";
import { Availability, Booking, BookingR, hours, Pagination } from "./Booking";
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

  const [openFilter, setOpenFilter] = useState(false);
  const [openGuestInfo, setOpenGuestInfo] = useState(false);

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
          checkIn: new Date(`${b.checkIn}Z`),
          checkOut: new Date(`${b.checkOut}Z`),
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
        let availabilities = rsp.data.availabilities?.map((a: any) => {
          return {
            ...a,
            from: new Date(`${a.from}Z`),
            to: new Date(`${a.to}Z`),
          };
        });
        setAvailabilities(availabilities);
        setChoices(
          rsp.data.choices === null ? [] : (rsp.data.choices as Availability[]),
        );
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

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const cancelFilter = () => {
    setOpenFilter(false);
  };

  const applyFilter = () => {
    if (!booking || !booking.id) {
      console.warn("No booking details available, skip handling apply filter.");
      return;
    }
    fetchAvailabilities(booking.id);
    setOpenFilter(false);
  };

  const selectAvailability = (a: Availability) => {
    setAvailabilities(availabilities.filter((av) => av.id !== a.id));
    setChoices([...choices, a]);
  };
  const deselectAvailability = (a: Availability) => {
    setChoices(choices.filter((c) => c.id !== a.id));
    setAvailabilities([...availabilities, a]);
  };

  const closeGuestInfo = () => {
    setOpenGuestInfo(false);
  };

  return (
    <>
      <div className="flex w-full flex-col space-y-0.5 border-rose-100 bg-rose-50 px-2">
        <span className="text-sm font-semibold text-rose-800">
          Selected Options
        </span>
        {choices?.map((choice) => {
          let room = rooms.find((r) => r.id === choice.roomId);
          return room ? (
            <div
              className="relative flex flex-row items-center rounded-md border border-gray-300 bg-orange-200 shadow-2xl "
              key={choice.id}
            >
              <div className="py-2 pl-0.5 pr-1">
                <Avatar
                  img={"/logo192.jpg"}
                  alt="dish image"
                  rounded
                  className="w-12"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex flex-row">
                  <Link
                    to=""
                    className="overflow-hidden font-medium text-green-800 hover:underline "
                  >
                    {room.name}
                  </Link>
                </div>
                <div className="flex flex-row space-x-2 text-sm">
                  <div className="flex items-center space-x-0.5">
                    <FaMoneyBill size="1em" className="text-yellow-700" />
                    <span>{formatVND(choice.price) ?? "N/A"}</span>
                  </div>
                  <div className="flex items-center space-x-0.5">
                    <FaClock size="1em" className="text-yellow-700" />
                    <span>{`${formatSimpleDateTime(
                      choice.from,
                    )}-${formatSimpleDateTime(choice.to)}`}</span>
                  </div>
                </div>
                <div className="flex flex-row items-center space-x-2 py-1">
                  <Button size="xs" color="green" onClick={() => deselectAvailability(choice)}>
                    <FaArrowDown size="1.2em" className="mr-2" />
                    Deselect
                  </Button>
                  <Button size="xs" color="gray">
                    <FaEye size="1.2em" className="mr-2" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          );
        })}
      </div>
      <div className="w-full flex-1 flex-col space-y-0.5 overflow-y-auto bg-green-100 mt-2 px-2">
        <span className="text-sm font-semibold text-green-800">
          Available Options
        </span>
        {availabilities?.map((a) => {
          let room = rooms.find((r) => r.id === a.roomId);
          return room ? (
            <div
              className="relative flex flex-row items-center rounded-md border border-gray-300 bg-white shadow-2xl dark:bg-slate-500"
              key={a.id}
            >
              <div className="py-2 pl-0.5 pr-1">
                <Avatar
                  img={"/logo192.jpg"}
                  alt="dish image"
                  rounded
                  className="w-12"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex flex-row">
                  <Link
                    to=""
                    className="overflow-hidden font-medium text-green-800 hover:underline dark:text-gray-200"
                  >
                    {room.name}
                  </Link>
                </div>
                <div className="flex flex-row space-x-2 text-sm">
                  <div className="flex items-center space-x-0.5">
                    <FaMoneyBill size="1em" className="text-yellow-700" />
                    <span>{formatVND(a.price) ?? "N/A"}</span>
                  </div>
                  <div className="flex items-center space-x-0.5">
                    <FaClock size="1em" className="text-yellow-700" />
                    <span>{`${formatSimpleDateTime(
                      a.from,
                    )}-${formatSimpleDateTime(a.to)}`}</span>
                  </div>
                </div>
                <div className="flex flex-row items-center space-x-2 py-1">
                  <Button
                    size="xs"
                    color="green"
                    onClick={() => selectAvailability(a)}
                  >
                    <FaArrowUp size="1.2em" className="mr-2" />
                    Select
                  </Button>
                  <Button size="xs" color="gray">
                    <FaEye size="1.2em" className="mr-2" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          );
        })}
      </div>
      <div className="absolute bottom-1 left-1/2 flex w-11/12 -translate-x-1/2 flex-row items-center justify-center space-x-2 rounded-3xl bg-slate-300 opacity-70 shadow-sm">
        <Button size="xs" color="green" onClick={() => setOpenFilter(true)}>
          <FaFilter size="1.5em" className="mr-2" />
          Filter
        </Button>
        <Button size="xs" color="green">
          <FaArrowAltCircleRight size="1.5em" className="mr-2" />
          Next
        </Button>
      </div>
      <Modal show={openFilter} size="md" popup={true} onClose={cancelFilter}>
        <Modal.Header />
        <Modal.Body>
          <div className="h-full w-full space-y-2 pb-2 sm:pb-6 lg:px-8 xl:pb-8">
            <div className="flex w-full flex-col align-middle">
              <div className="flex w-3/5 items-center">
                <Label htmlFor="checkIn" value="Check In" />
              </div>

              <div className="flex w-full flex-row">
                <Datepicker
                  id="checkIn"
                  required={true}
                  type="date"
                  value={booking ? formatLocaleDate(booking.checkIn) : ""}
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
                  value={booking ? formatLocaleDate(booking.checkOut) : ""}
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
        </Modal.Body>
        <Modal.Footer className="flex justify-center">
          <Button onClick={cancelFilter} color="gray" size="sm">
            <FaXbox size="1.5em" className="mr-2" />
            Cancel
          </Button>
          <Button onClick={applyFilter} color="green" size="sm">
            <FaCheck size="1.5em" className="mr-2" />
            Apply
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={openGuestInfo} size="md" popup={true} onClose={closeGuestInfo}>
        <Modal.Header />
        <Modal.Body>
          <div className="h-full w-full space-y-2 pb-2 sm:pb-6 lg:px-8 xl:pb-8">
            <div className="flex w-full flex-col align-middle">
              <div className="flex w-3/5 items-center">
                <Label htmlFor="guestName" value="Guest Name" />
              </div>
              <TextInput
                id="guestName"
                placeholder="John Doe"
                required={true}
                value={booking?.guestName || ""}
                onChange={handleTextChange}
                className="w-full"
                rightIcon={() => <FaTrash onClick={() => emptyTextInput("guestName")} />}
              />
            </div>
            <div className="flex w-full flex-col align-middle">
              <div className="flex w-3/5 items-center">
                <Label htmlFor="phoneNumber" value="Phone Number" />
              </div>
              <TextInput
                id="phoneNumber"
                placeholder="+84 123 456 789"
                required={true}
                value={booking?.phoneNumber || ""}
                onChange={handleTextChange}
                className="w-full"
                rightIcon={() => <FaTrash onClick={() => emptyTextInput("phoneNumber")} />}
              />
            </div>
            <div className="flex w-full flex-col align-middle">
              <div className="flex w-3/5 items-center">
                <Label htmlFor="email" value="Email" />
              </div>
              <TextInput
                id="email"
                placeholder="john.doe@example.com"
                required={true}
                value={booking?.email || ""}
                onChange={handleTextChange}
                className="w-full"
                rightIcon={() => <FaTrash onClick={() => emptyTextInput("email")} />}
              />
            </div>
            <div className="flex w-full flex-col align-middle">
              <div className="flex w-3/5 items-center">
                <Label htmlFor="note" value="Note" />
              </div>
              <Textarea
                id="note"
                placeholder="Additional notes for this booking"
                required={true}
                value={booking?.note || ""}
                onChange={handleTextAreaChange}
                className="w-full"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-center">
          <Button onClick={cancelFilter} color="gray" size="sm">
            <FaXbox size="1.5em" className="mr-2" />
            Cancel
          </Button>
          <Button onClick={applyFilter} color="green" size="sm">
            <FaCheck size="1.5em" className="mr-2" />
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
