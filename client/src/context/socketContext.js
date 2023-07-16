import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useMyContext } from "./context";

export const SocketContext = React.createContext();

export const SocketProvider = ({ children }) => {
  const { authState, socket } = useMyContext();
  const [requestReceived, setRequestReceived] = useState(false);
  const [messageReceived, setMessageReceived] = useState({
    received: false,
    seen: true,
    author: "",
  });
  const [messageReceivedGC, setMessageReceivedGC] = useState({
    received: false,
    seen: false,
    name: "",
    id: 0,
    authorName: "",
  });
  const [messageContent, setMessageContent] = useState({});

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_URL}users/notification`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((res) => {
        if (res.data.status === "SUCCESS") {
          if (res.data.friendshipNotification) {
            setRequestReceived(true);
          }
          if (res.data.messageNotification) {
            setMessageReceived({
              received: true,
              seen: false,
              author: res.data.message.author,
            });
          }
          if (res.data.gcMessageNotification) {
            setMessageReceivedGC({
              received: true,
              seen: false,
              name: res.data.groupChat.name,
              id: res.data.groupChat.id,
              author: res.data.gcMessage.authorID,
            });
          }
        }
      })
      .catch((error) => console.log(error));
  }, []);

  const receiveFriendRequest = ({ from, to }) => {
    if (authState.id.toString() !== to) return;
    setRequestReceived(true);
  };

  const receiveMessage = ({ to, content }) => {
    const { message, author } = content;
    setMessageReceived({ received: true, seen: false, author });
    setMessageContent({ message, author, to });
  };

  const receiveMessageGC = ({ id, to, content }) => {
    const { message, author } = content;
    if (author === authState.id) return;
    setMessageReceivedGC({
      received: true,
      seen: false,
      name: to,
      id: parseInt(id),
      author,
      authorName: content.authorName,
    });
  };

  useEffect(() => {
    socket && socket.on("receive_friend_request", receiveFriendRequest);
    socket && socket.on("receive_message", receiveMessage);
    socket && socket.on("receive_message_gc", receiveMessageGC);

    return () => {
      socket && socket.off("receive_friend_request", receiveFriendRequest);
      socket && socket.off("receive_message", receiveMessage);
      socket && socket.off("receive_message_gc", receiveMessageGC);
    };
  });

  return (
    <SocketContext.Provider
      value={{
        requestReceived,
        setRequestReceived,
        messageReceived,
        setMessageReceived,
        messageContent,
        messageReceivedGC,
        setMessageReceivedGC,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  return useContext(SocketContext);
};
