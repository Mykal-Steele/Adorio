// feelio/src/components/NotificationBell.jsx
import React, { useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useSocket } from "../hooks/useSocket";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useSocket({
    newNotification: (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
  });

  return (
    <div className="relative">
      <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
          w-4 h-4 rounded-full flex items-center justify-center"
        >
          {unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
