import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useMyContext } from "./context";

export const HomeContext = React.createContext();

export const HomeProvider = ({ children }) => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  return (
    <HomeContext.Provider
      value={{
        friendRequests,
        setFriendRequests,
        friends,
        setFriends,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export const useHomeContext = () => {
  return useContext(HomeContext);
};
