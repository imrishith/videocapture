import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

// Use domain + proxy path instead of direct IP + port
const SOCKET_SERVER_URL = "https://ikigaiclinics.neurom.in"; // No need to add /socket.io, Socket.IO handles it

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(() => io(SOCKET_SERVER_URL, {
    path: "/socket.io", // This ensures correct routing via Nginx
    transports: ["websocket", "polling"]
  }), []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
