"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = getSocket("USER_JWT_TOKEN"); // replace with real token

    newSocket.on("connect", () => {
      console.log("🟢 Connected:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔴 Disconnected:", reason);
    });

    newSocket.on("connect_error", (err) => {
      console.log("⚠️ Error:", err.message);
    });

    setSocket(newSocket);

    // 👇 Reconnect when tab becomes active
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !newSocket.connected) {
        newSocket.connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};