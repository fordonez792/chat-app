import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import io from "socket.io-client";

export const AppContext = React.createContext();

const newSocket = io(process.env.REACT_APP_URL, { autoConnect: false });

export const AppProvider = ({ children }) => {
  const [socket, setSocket] = useState();
  const [authState, setAuthState] = useState({
    username: "",
    id: 0,
    status: false,
  });

  useEffect(() => {
    if (authState.status === true) {
      newSocket.auth = {
        username: authState.username,
        userId: authState.id.toString(),
      };
      newSocket.connect();
      setSocket(newSocket);
    }
    if (authState.status === false) {
      newSocket.disconnect();
      setSocket(undefined);
    }
  }, [authState]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_URL}users/auth`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((res) => {
        if (res.data.error) setAuthState({ ...authState, status: false });
        else {
          setAuthState({
            username: res.data.username,
            id: res.data.id,
            status: true,
          });
        }
      });
  }, []);

  const receiveFriendRequest = ({ from, to, content }) => {
    if (!authState.status) return;
    if (authState.id.toString() !== to) return;
    console.log(content);
  };

  return (
    <AppContext.Provider
      value={{
        authState,
        setAuthState,
        socket,
        receiveFriendRequest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useMyContext = () => {
  return useContext(AppContext);
};
