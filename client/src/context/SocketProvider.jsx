import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://10.1.5.211:8001"; // Update with your actual IP and port

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(() => io(SOCKET_SERVER_URL, { transports: ["websocket", "polling"] }), []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};