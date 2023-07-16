import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaChevronRight, FaCheckCircle } from "react-icons/fa";
import axios from "axios";

import { useMyContext } from "../context/context";
import { useSocketContext } from "../context/socketContext";

const ChatRoom = () => {
  const { socket, authState } = useMyContext();
  const { messageContent, messageReceived, setMessageReceived } =
    useSocketContext();
  const navigate = useNavigate();
  const { room } = useParams();
  const resizeRef = useRef();
  const buttonRef = useRef();
  const joinedRef = useRef();
  const seenRef = useRef();
  const scrollBottomRef = useRef();
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [typing, setTyping] = useState(false);

  // useEffect will check if user is logged in and if yes retrieve all messages belonging to the appropriate chat
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }
    axios
      .get(`${process.env.REACT_APP_URL}chat-messages/${room}`, {
        headers: { accessToken },
      })
      .then((res) => {
        if (res.data.status === "FAILED") {
          console.log(res.data.message);
          return;
        }
        setMessageList(res.data.messages);
        setMessageReceived({ received: false, seen: true, author: "" });
        scrollBottomRef.current.scrollIntoView(false);
      })
      .catch((error) => console.log(error));
  }, []);

  // useEffect will prevent empty messages from being sent, styling appropriately once there is at least 1 character in the input box
  useEffect(() => {
    if (message === "") {
      resizeRef.current.style.width = "calc(90% - 20px)";
      buttonRef.current.style.opacity = "0";
      buttonRef.current.style.pointerEvents = "none";
    } else {
      resizeRef.current.style.width = "calc(80% - 20px)";
      buttonRef.current.style.opacity = "1";
      buttonRef.current.style.pointerEvents = "all";

      socket && socket.emit("typing", { to: room });
      scrollBottomRef.current.scrollIntoView(false, {
        block: "end",
        behavior: "smooth",
        inline: "end",
      });
    }
  }, [message]);

  // Once user leaves chat it will also notify the other person
  const leaveRoom = async () => {
    if (!room.split("-", 4)[2]) await socket.emit("leave_room", { to: room });
    navigate("/");
  };

  // Handles the socket event to send a message as well as adding message to screen as well as resetting the input box
  const sendMessage = async (e) => {
    e.preventDefault();
    await socket.emit("send_message", {
      to: room,
      content: { message, author: authState.username },
    });
    setMessage("");
    resizeRef.current.textContent = "";
  };

  useEffect(() => {
    scrollBottomRef.current.scrollIntoView(false, {
      block: "end",
      behavior: "smooth",
      inline: "end",
    });
  }, [sendMessage]);

  // Handles the styling and notification once user enters chat
  const joined = ({ to, from }) => {
    joinedRef.current.textContent = "In the chat now";
    joinedRef.current.classList.add("active");
    socket && socket.emit("user_joined", { to, from });
  };

  const alsoJoined = () => {
    joinedRef.current.textContent = "In the chat now";
    joinedRef.current.classList.add("active");
  };

  // Handles the styling and notification once user leaves chat
  const left = () => {
    joinedRef.current.textContent = "";
    joinedRef.current.classList.remove("active");
  };

  // Will allow for other user in chat know that the user is typing
  const isTyping = () => {
    setTyping(true);
    scrollBottomRef.current.scrollIntoView(false, {
      block: "end",
      behavior: "smooth",
      inline: "end",
    });
    const timeout = setTimeout(() => setTyping(false), 1000);
    if (typing) clearTimeout(timeout);
  };

  const hasSeen = ({ seenMessages }) => {
    if (seenMessages.length < 0) return;
    setMessageList((messageList) =>
      messageList.map((message) => {
        return (
          seenMessages.find((seenMsg) => seenMsg.id === message.id) || message
        );
      })
    );
  };

  const messageSent = ({ newMessage }) => {
    setMessageList([
      ...messageList,
      {
        ...newMessage,
        seen: joinedRef.current.classList.contains("active") ? true : false,
      },
    ]);
    if (messageReceived.received && messageReceived.author === room) {
      setMessageReceived({ received: false, seen: true, author: "" });
      scrollBottomRef.current.scrollIntoView({
        block: "end",
        behavior: "smooth",
        inline: "end",
      });
      socket.emit("immediate_seen", {
        id: newMessage.id,
        from: author,
        to,
      });
    }
  };

  // useEffect will receive all events coming from server
  useEffect(() => {
    socket && socket.on("joined", joined);
    socket && socket.on("left", left);
    socket && socket.on("is_typing", isTyping);
    socket && socket.on("has_seen", hasSeen);
    socket && socket.on("also_joined", alsoJoined);
    socket && socket.on("message_sent", messageSent);

    return () => {
      socket && socket.off("joined", joined);
      socket && socket.off("left", left);
      socket && socket.off("is_typing", isTyping);
      socket && socket.off("has_seen", hasSeen);
      socket && socket.off("also_joined", alsoJoined);
      socket && socket.off("message_sent", messageSent);
    };
  });

  return (
    <section id="chat-room" className="page">
      <div className="container">
        <article className="navbar">
          <div className="go-back" onClick={leaveRoom}>
            <FaArrowLeft />
          </div>
          <div className="header">
            <h1>{room}</h1>
            <p ref={joinedRef} className="joined"></p>
          </div>
        </article>
        <article ref={seenRef} className="chat-container">
          {messageList.map((message, index) => {
            return (
              <div
                key={index}
                className={`message ${
                  authState.username === message?.author && "mine"
                } ${message?.seen && "seen"}`}
              >
                <p className="content">{message?.message}</p>
                {authState.username === message?.author && !message?.seen && (
                  <span>
                    <FaCheckCircle />
                  </span>
                )}
              </div>
            );
          })}
          {typing && (
            <div className="typing content">
              <div className="container">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          )}
          <div className="scroll-to" ref={scrollBottomRef}></div>
        </article>
        <article className="send-message">
          <form className="form-container">
            <div
              ref={resizeRef}
              className="message-input"
              contentEditable="true"
              value={message}
              onInput={(e) => setMessage(e.target.textContent)}
            ></div>
            <button ref={buttonRef} onClick={(e) => sendMessage(e)}>
              <FaChevronRight />
            </button>
          </form>
        </article>
      </div>
    </section>
  );
};

export default ChatRoom;
