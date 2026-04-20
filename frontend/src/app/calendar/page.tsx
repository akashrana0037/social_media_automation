"use client";

import React from "react";
import Link from "next/link";

interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  platforms: any[];
  status: string;
  type: string;
}

export default function VisualCalendarPage() {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [isLoading, setIsLoading] = React.useState(true);

  const [showUpload, setShowUpload] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<any>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/calendar/`, {
         headers: { "ngrok-skip-browser-warning": "true" }
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch calendar events");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEvents();
  }, []);

  const downloadTemplate = async () => {
    window.open(`${backendUrl}/api/calendar/template`, '_blank');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`${backendUrl}/api/calendar/upload`, {
          method: 'POST',
          headers: { "ngrok-skip-browser-warning": "true" },
          body: formData
        });
        const data = await res.json();
        if (data.status === 'success') {
          setUploadStatus({ type: 'success', message: `Successfully created ${data.posts_created} posts!` });
          fetchEvents();
          setTimeout(() => setShowUpload(false), 2000);
        } else {
          setUploadStatus({ type: 'error', message: data.message || 'Failed to upload CSV.' });
        }
      } catch (err) {
        setUploadStatus({ type: 'error', message: 'Connection error during upload.' });
      }
    }
  };

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const renderCalendar = () => {
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);
    const cells = [];

    // Empty cells for padding
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-32 border-b border-r border-gray-100 bg-gray-50/30"></div>);
    }

    // Actual day cells
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.start.startsWith(dateStr));

      cells.push(
        <div key={day} className="h-32 border-b border-r border-gray-100 p-2 hover:bg-yellow-50/20 transition-colors group relative">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-gray-300 group-hover:text-yellow-600 transition-colors">{day}</span>
            {dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>}
          </div>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
            {dayEvents.map(e => (
              <div key={e.id} className="p-1 px-2 bg-white border border-gray-100 rounded shadow-sm text-[9px] font-bold flex flex-col gap-0.5">
                <div className="truncate uppercase tracking-tighter text-gray-700">{e.title}</div>
                <div className="flex gap-1">
                   <span className="text-[8px] text-gray-400 uppercase">{e.type}</span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/posts/create" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-black text-[10px] font-black">+</span>
          </Link>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-yellow-100 relative">
      {/* Upload Overlay */}
      {showUpload && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white rounded-3xl w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setShowUpload(false)} className="absolute top-6 right-6 text-gray-300 hover:text-black">&times;</button>
              <div className="text-center space-y-6">
                 <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto text-2xl">📁</div>
                 <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter">Bulk Import Posts</h3>
                    <p className="text-xs text-gray-400 font-medium">Upload a CSV to schedule your entire month instantly.</p>
                 </div>
                 
                 <div className="space-y-4">
                    <button 
                      onClick={() => document.getElementById('csv-upload')?.click()}
                      className="w-full btn-simple btn-yellow py-4 font-black uppercase tracking-widest"
                    >
                      Choose CSV File
                    </button>
                    <input id="csv-upload" type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                    
                    <button 
                      onClick={downloadTemplate}
                      className="w-full text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Download Template .CSV
                    </button>
                 </div>

                 {uploadStatus && (
                   <div className={`p-4 rounded-xl text-xs font-bold ${uploadStatus.type === 'success' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'}`}>
                      {uploadStatus.message}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-gray-400 hover:text-black transition-colors font-black text-[10px] uppercase">
             &larr; Exit
          </Link>
          <div className="h-4 w-[1px] bg-gray-100"></div>
          <h1 className="text-sm font-black tracking-tighter uppercase">{monthName} {year}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition-all">&larr;</button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all">Today</button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition-all">&rarr;</button>
          </div>
          
          <button 
            onClick={() => setShowUpload(true)}
            className="btn-simple btn-yellow px-6 py-2 text-[10px]"
          >
            Bulk Import
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[#fafafa]">
        <div className="max-w-[1400px] mx-auto p-8">
           <div className="grid grid-cols-7 border-t border-l border-gray-100 rounded-xl overflow-hidden shadow-2xl shadow-gray-200/50 bg-white">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50/50 border-b border-r border-gray-100">
                  {d}
                </div>
              ))}
              {renderCalendar()}
           </div>
        </div>
      </main>
    </div>
  );
}
