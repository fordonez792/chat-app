import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaComment,
  FaUserPlus,
  FaSignOutAlt,
  FaUserCheck,
} from "react-icons/fa";
import axios from "axios";

import { useMyContext } from "../../context/context";
import { useHomeContext } from "../../context/homeContext";
import { useSocketContext } from "../../context/socketContext";

const GroupChatMember = ({
  id,
  creatorId,
  groupChatId,
  setMembers,
  username,
  status,
  admin,
  friend,
}) => {
  const navigate = useNavigate();

  const { socket, authState } = useMyContext();
  const { messageReceived } = useSocketContext();
  const [sendRequest, setSendRequest] = useState(false);

  const statusRef = useRef();

  // Set status bubble for each friend
  useEffect(() => {
    if (status === "ONLINE") {
      statusRef.current.style.setProperty("--status", "#228b22");
    }
    if (status === "IDLE") {
      statusRef.current.style.setProperty("--status", "#E49B0F");
    }
    if (status === "OFFLINE" || status === "DO_NOT_DISTURB") {
      statusRef.current.style.setProperty("--status", "#D22B2B");
    }
    if (status === "INVISIBLE") {
      statusRef.current.style.setProperty("--status", "#808080");
    }
  }, [status]);

  // Lets other user now that u are in the chat
  const joinChatRoom = async () => {
    await socket.emit("join_room", {
      to: username,
      from: authState.username,
    });
    if (!messageReceived.seen) {
      await socket.emit("seen", {
        to: username,
        from: authState.username,
      });
    }
    navigate(`/chatroom/${username}`);
  };

  const addFriend = async () => {
    await socket.emit("friend_request", { to: id.toString() });
    setSendRequest(true);
  };

  const removeFromGroup = () => {
    if (creatorId !== authState.id) return;
    axios
      .delete(
        `${
          process.env.REACT_APP_URL
        }group-chats/remove-member/${id.toString()}/${groupChatId}`,
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then((res) => {
        if (res.data.status === "FAILED") {
          console.log(res.data.message);
          return;
        }
        if (res.data.status === "SUCCESS") {
          setMembers((members) => {
            return members.filter((member) => {
              if (member.id !== id) {
                return member;
              }
            });
          });
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <section ref={statusRef} id="member">
      <div className="container">
        <div className="friend" data-id={id}>
          <article className="img">
            <FaUserCircle className="profile-icon" />
          </article>
          <article className="username">
            <div className="header">
              <h1>
                {creatorId === authState.id
                  ? admin
                    ? "You (admin)"
                    : username
                  : admin
                  ? `${username} (admin)`
                  : authState.id === id
                  ? "You"
                  : username}
              </h1>
            </div>
          </article>
          <article className="btn-container">
            {admin ? (
              creatorId === authState.id ? (
                <div className="pointer"></div>
              ) : friend ? (
                <div onClick={joinChatRoom}>
                  <FaComment />
                </div>
              ) : (
                <div onClick={addFriend}>
                  {sendRequest ? <FaUserCheck /> : <FaUserPlus />}
                </div>
              )
            ) : friend ? (
              <div onClick={joinChatRoom}>
                <FaComment />
              </div>
            ) : authState.id !== id ? (
              <div onClick={addFriend}>
                {sendRequest ? <FaUserCheck /> : <FaUserPlus />}
              </div>
            ) : (
              <div className="pointer"></div>
            )}
            {creatorId === authState.id ? (
              admin ? (
                <div className="pointer"></div>
              ) : (
                <div onClick={removeFromGroup}>
                  <FaSignOutAlt />
                </div>
              )
            ) : (
              <div className="pointer"></div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
};

export default GroupChatMember;
