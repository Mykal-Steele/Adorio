// feelio/src/hooks/useSocket.js
import { useEffect } from "react";
import io from "socket.io-client";

const useSocket = (eventHandlers) => {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [eventHandlers]);
};

export default useSocket;
