import React, { useEffect, useState } from "react";
import "./App.css";
import { Booking } from "./Components/Booking";
import { Welcome } from "./Components/Welcome";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt } from "react-icons/fa";

export const DEFAULT_PAGE_SIZE = Number(process.env.REACT_APP_DEFAULT_PAGE_SIZE) || 10;

const menus = {
  home: {
    path: 'home',
    displayName: 'Home',
    title: 'Welcome',
    icon: <FaHome size={28} />
  },
  booking: {
    path: 'booking',
    displayName: 'Booking',
    title: 'Booking',
    icon: <FaCalendarAlt size={28} />
  }
};

export const App = () => {
  const [filteredMenus, setFilteredMenus] = useState([menus.home, menus.booking]);
  const [activeMenu, setActiveMenu] = useState(menus.home);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Booking";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const menuStyle = (m: string) =>
    m === activeMenu.path
      ? "px-1 py-1 bg-green-50 text-center text-green-800 text-sm font-sans rounded-sm shadow-sm transition-transform duration-150 scale-95 ring-2 ring-green-700"
      : "px-1 py-1 bg-green-50 text-center text-green-800 text-sm font-sans rounded-sm shadow-sm transition-transform duration-150";

  return (
    <div className="flex flex-col relative h-[100dvh] min-h-0 bg-slate-50">
      <div className="mt-2">
        {activeMenu === menus.home ? (
          <div className="mt-36 grid grid-cols-3 gap-5 p-2 grid-rows-2">
            {filteredMenus.map((menu) => (
              <Link
                key={menu.path}
                to={menu.path}
                className={menuStyle(menu.path)}
                style={{ outline: "none" }}
                onClick={() => setActiveMenu(menu)}
              >
                <div className="flex flex-col items-center">
                  <span className="mb-1 text-green-800">{menu.icon}</span>
                  <span className="text-green-900 font-semibold">{menu.displayName}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="pl-2 flex items-center space-x-2">
            <button
              className="bg-green-100 text-green-900 px-2 py-1 rounded hover:bg-green-200 mr-2 border border-green-700"
              onClick={() => {
                setActiveMenu(menus.home);
                navigate('/home');
              }}
              type="button"
            >
              &larr; Back
            </button>
            <span className="text-2xl font-semibold text-green-900">{activeMenu.title}</span>
          </div>
        )}
      </div>

      <Routes>
        <Route path="" element={<Welcome activeMenu={() => setActiveMenu(menus.home)} />} />
        <Route path="home" element={<Welcome activeMenu={() => setActiveMenu(menus.home)} />} />
        <Route path="booking" element={<Booking activeMenu={() => setActiveMenu(menus.booking)} />} />
      </Routes>
    </div>
  );
};
