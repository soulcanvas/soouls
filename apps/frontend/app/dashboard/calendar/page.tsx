'use client';

import { useUser } from '@clerk/nextjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react';

const CalendarApp = () => {
  const { user } = useUser();
  const router = useRouter();

  const [view, setView] = useState('Monthly');

  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // FIX: prevent month overflow (March 31 → Feb bug)
  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(1);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const calendarGrid = useMemo(() => {
    const items: { day: number | null; key: string }[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      items.push({ day: null, key: `empty-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      items.push({ day: d, key: `day-${d}` });
    }

    return items;
  }, [firstDayOfMonth, daysInMonth]);

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans p-8 flex flex-col items-center justify-center overflow-hidden selection:bg-[#e67e65]/30 relative">
      {/* Background Text */}
      <div className="absolute top-[15%] left-0 w-full flex justify-center pointer-events-none select-none z-0">
        <h1
          className="text-[16vw] font-bold leading-none tracking-tighter text-transparent opacity-30"
          style={{
            WebkitTextStroke: '1.5px rgba(255,255,255,0.4)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Soulcanvas
        </h1>
      </div>

      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-12 relative z-10 px-4">
        <div className="flex items-baseline gap-1 text-2xl font-semibold tracking-tight">
          <button
            onClick={handleGoBack}
            className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer border-none bg-transparent p-0"
          >
            Home
          </button>
          <span className="text-gray-400 mx-1">/</span>
          <span className="text-[#e67e65]">Calendar</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-yellow-500 p-[2px] overflow-hidden bg-gray-800 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-700">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="User profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-zinc-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="w-full max-w-4xl bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 relative z-10 shadow-2xl">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-10">
            <button
              aria-label="Previous month"
              onClick={() => changeMonth(-1)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <ChevronLeft size={28} strokeWidth={1.5} />
            </button>

            <h2 className="text-3xl font-bold tracking-tight min-w-[240px] text-center">
              {months[month]} {year}
            </h2>

            <button
              aria-label="Next month"
              onClick={() => changeMonth(1)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <ChevronRight size={28} strokeWidth={1.5} />
            </button>
          </div>

          {/* View Switcher */}
          <div className="bg-black/60 p-1 rounded-full border border-white/5 flex items-center">
            {['Monthly', 'Weekly', 'Daily'].map((v) => {
              const disabled = v !== 'Monthly';

              return (
                <button
                  key={v}
                  onClick={() => !disabled && setView(v)}
                  disabled={disabled}
                  className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    view === v
                      ? 'bg-[#e67e65] text-white shadow-xl'
                      : disabled
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 mb-10">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex justify-center">
              <span className="text-[10px] font-black text-gray-400 tracking-[0.25em] bg-white/5 px-5 py-2.5 rounded-2xl uppercase">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-10">
          {calendarGrid.map((item, index) => {
            const isToday =
              item.day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <div key={item.key} className="relative flex justify-center items-center group">
                {item.day ? (
                  <>
                    <div
                      className={`w-14 h-16 flex items-center justify-center text-2xl font-light cursor-pointer transition-all duration-300 rounded-2xl ${
                        isToday
                          ? 'bg-[#e67e65] text-white shadow-2xl shadow-[#e67e65]/40 scale-105'
                          : 'text-gray-300 hover:bg-white/5 hover:scale-110'
                      }`}
                    >
                      {item.day}
                    </div>

                    {(index + 1) % 7 !== 0 && (
                      <div className="absolute right-0 h-12 w-[1px] bg-white/5 top-1/2 -translate-y-1/2" />
                    )}
                  </>
                ) : (
                  <div className="w-14 h-16" />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Search */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <button className="bg-[#1a1a1a] border border-white/10 px-8 py-3 rounded-full text-xs text-gray-500 font-bold flex items-center gap-2 hover:border-[#e67e65]/50 hover:text-gray-300 transition-all shadow-2xl group uppercase tracking-widest">
            <span className="opacity-60 group-hover:opacity-100 transition-opacity">
              Ctrl + k to search
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarApp;
