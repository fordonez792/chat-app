import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppProvider } from "./context/context";
import { SocketProvider } from "./context/socketContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AppProvider>
  </React.StrictMode>
);
