import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaChevronRight,
  FaCheckCircle,
  FaUsersCog,
  FaUser,
} from "react-icons/fa";
import axios from "axios";

import Settings from "./Settings";

import { useMyContext } from "../../context/context";
import { useSocketContext } from "../../context/socketContext";

const GroupChatRoom = () => {
  const { socket, authState } = useMyContext();
  const { messageReceivedGC, setMessageReceivedGC } = useSocketContext();
  const navigate = useNavigate();
  const { name, id } = useParams();
  const resizeRef = useRef();
  const buttonRef = useRef();
  const joinedRef = useRef();
  const seenRef = useRef();
  const scrollBottomRef = useRef();
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [groupChat, setGroupChat] = useState({});
  const [typing, setTyping] = useState({ is: false, username: "" });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // useEffect will check if user is logged in and if yes retrieve all messages belonging to the appropriate chat
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }
    axios
      .get(
        `${process.env.REACT_APP_URL}group-chat-messages/get-messages/${id}`,
        {
          headers: { accessToken },
        }
      )
      .then((res) => {
        if (res.data.status === "FAILED") {
          console.log(res.data.message);
          return;
        }
        setGroupChat(res.data.groupChat);
        setMessageList(res.data.messages);
        setMessageReceivedGC({
          received: false,
          seen: true,
          author: "",
          id: 0,
          name: "",
        });
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

      socket &&
        socket.emit("typing_gc", {
          to: name,
          id,
          username: authState.username,
        });
      scrollBottomRef.current.scrollIntoView(false, {
        block: "end",
        behavior: "smooth",
        inline: "end",
      });
    }
  }, [message]);

  // Once user leaves chat it will also notify the other person
  const leaveRoom = async () => {
    navigate("/");
  };

  // Handles the socket event to send a message as well as adding message to screen as well as resetting the input box
  const sendMessage = async (e) => {
    e.preventDefault();
    await socket.emit("send_message_gc", {
      to: name,
      id,
      content: {
        message,
        author: authState.id,
        authorName: authState.username,
      },
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

  // Will allow for other user in chat now that the user is typing
  const isTyping = ({ room, username }) => {
    if (room !== `${name}-${id}`) return;
    setTyping({ is: true, username });
    scrollBottomRef.current.scrollIntoView(false, {
      block: "end",
      behavior: "smooth",
      inline: "end",
    });
    const timeout = setTimeout(
      () => setTyping({ is: false, username: "" }),
      1000
    );
    if (typing.is) clearTimeout(timeout);
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

  const messageSent = async ({ newMessage, groupChat, content }) => {
    if (groupChat.socketRoom !== `${name}-${id}`) return;
    setMessageList([
      ...messageList,
      {
        ...newMessage,
        authorName: content.authorName,
        seenUsernames: [],
      },
    ]);
    if (
      messageReceivedGC.received &&
      messageReceivedGC.author !== "" &&
      messageReceivedGC.author !== authState.id
    ) {
      await socket.emit("immediate_seen_gc", {
        userId: authState.id,
        messageId: newMessage.id,
      });
      setMessageReceivedGC({ received: false, seen: true, author: "" });
    }
  };

  const revealSeen = (e) => {
    const seen = e.target.parentElement.children[1];
    seen.classList.toggle("active");
  };

  // useEffect will receive all events coming from server
  useEffect(() => {
    socket && socket.on("is_typing_gc", isTyping);
    socket && socket.on("has_seen", hasSeen);
    socket && socket.on("message_sent_gc", messageSent);

    return () => {
      socket && socket.off("is_typing_gc", isTyping);
      socket && socket.off("has_seen", hasSeen);
      socket && socket.off("message_sent_gc", messageSent);
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
            <h1>{name}</h1>
            <p ref={joinedRef} className="joined"></p>
          </div>
          <div className="settings" onClick={() => setIsSettingsOpen(true)}>
            <FaUsersCog />
          </div>
        </article>
        <article ref={seenRef} className="chat-container">
          {messageList.map((message, index) => {
            return (
              <div
                key={index}
                className={`message seen ${
                  authState.id === message?.authorId && "mine"
                }`}
              >
                <p className="content" onClick={(e) => revealSeen(e)}>
                  {authState.id !== message?.authorId && (
                    <span className="author">{message.authorName}</span>
                  )}
                  {message?.message}
                </p>
                <p className="seen-users">
                  Seen by{" "}
                  {message.seenUsernames.length > 0
                    ? message.seenUsernames.map((username, index) => {
                        if (
                          message.seenUsernames.length === 1 ||
                          message.seenUsernames.length - 2 === index
                        ) {
                          return `${username}`;
                        }
                        if (message.seenUsernames.length - 1 !== index) {
                          return `${username}, `;
                        }
                        if (message.seenUsernames.length - 1 === index) {
                          return ` and ${username}`;
                        }
                      })
                    : "no one"}
                </p>
              </div>
            );
          })}
          {typing.is && (
            <div className="typing content">
              <p className="author">{typing.username}</p>
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
      <section id="settings" className={`page ${isSettingsOpen && "active"}`}>
        <Settings setIsSettingsOpen={setIsSettingsOpen} name={name} id={id} />
      </section>
    </section>
  );
};

export default GroupChatRoom;
