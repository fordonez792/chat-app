import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

import { useMyContext } from "../../context/context";
import { useSocketContext } from "../../context/socketContext";

const GroupChat = ({
  id,
  name,
  hasMessages,
  lastMessage,
  authorName,
  createdAt,
}) => {
  const { messageReceivedGC } = useSocketContext();
  const { socket, authState } = useMyContext();
  const navigate = useNavigate();
  const [time, setTime] = useState("");
  const lastMessageRef = useRef();

  // Helper function that will set date of the last message sent
  const setDate = () => {
    const todayDate = new Date();
    let messageDate;
    if (lastMessage !== "No Messages") {
      messageDate = new Date(lastMessage.createdAt);
    } else {
      messageDate = new Date(createdAt);
    }
    if (
      todayDate.getFullYear() === messageDate.getFullYear() &&
      todayDate.getMonth() === messageDate.getMonth() &&
      todayDate.getDate() === messageDate.getDate()
    ) {
      setTime(
        `${messageDate.getHours()}:${
          messageDate.getMinutes() < 10
            ? `0${messageDate.getMinutes()}`
            : `${messageDate.getMinutes()}`
        }`
      );
    } else if (
      todayDate.getFullYear() === messageDate.getFullYear() &&
      todayDate.getMonth() === messageDate.getMonth() &&
      todayDate.getDate() - 1 === messageDate.getDate()
    ) {
      setTime("Yesterday");
    } else {
      setTime(
        `${
          messageDate.getMonth() + 1
        }/${messageDate.getDate()}/${messageDate.getFullYear()}`
      );
    }
  };

  const goToChat = async () => {
    if (!messageReceivedGC.seen) {
      await socket.emit("seen_gc", { name, id, userId: authState.id });
    }
    navigate(`/groupchatroom/${name}/${id}`);
  };

  useEffect(() => {
    setDate();
    if (
      !messageReceivedGC.seen &&
      name === messageReceivedGC.name &&
      id === parseInt(messageReceivedGC.id)
    ) {
      lastMessageRef.current.style.fontWeight = "700";
      lastMessageRef.current.style.color = "var(--navy)";
    }
  }, []);

  return (
    <section id="friend" className="all" onClick={goToChat}>
      <div className="container">
        <div className="friend" data-friendship={id}>
          <p className="last-message-date">{time}</p>
          <article className="img1">
            <FaUserCircle className="profile-icon" />
          </article>
          <article className="username">
            <div className="header">
              <h1>{name}</h1>
            </div>
            {hasMessages ? (
              lastMessage && (
                <p ref={lastMessageRef} className="last-message">
                  {lastMessage.authorId === authState.id
                    ? `You: ${lastMessage.message}`
                    : `${authorName}: ${lastMessage.message}`}
                </p>
              )
            ) : (
              <p className="last-message">No Messages</p>
            )}
          </article>
          <article className="btn-container hide">
            <div></div>
            <div></div>
            <div></div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default GroupChat;
