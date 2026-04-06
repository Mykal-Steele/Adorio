import { useEffect, useState } from "react";
import { format } from "date-fns";

const CalendarWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow-lg mt-8 relative border-t-8 border-red-500">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-neutral-400"></div>
      <div className="text-center">
        <div className="text-4xl font-bold text-neutral-800">
          {format(currentTime, "d")}
        </div>
        <div className="text-red-500 font-bold tracking-widest text-sm">
          {format(currentTime, "MMMM yyyy")}
        </div>
        <div className="mt-2 text-neutral-400 text-xs font-main border-t pt-2">
          {format(currentTime, "hh:mm a")}
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
