import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaComment, FaUser, FaTrash } from "react-icons/fa";
import axios from "axios";

import { useMyContext } from "../context/context";
import { useHomeContext } from "../context/homeContext";
import { useSocketContext } from "../context/socketContext";
import ProfileModal from "./ProfileModal";

const Friend = ({ friend, id, command, lastMessage, room, hasMessages }) => {
  const navigate = useNavigate();

  const { friends, setFriends } = useHomeContext();
  const { socket, authState } = useMyContext();
  const { messageReceived } = useSocketContext();

  const [profile, setProfile] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  const [time, setTime] = useState("");
  const statusRef = useRef();
  const lastMessageRef = useRef();

  // Set status bubble for each friend
  useEffect(() => {
    if (friend.status === "ONLINE") {
      statusRef.current.style.setProperty("--status", "#228b22");
    }
    if (friend.status === "IDLE") {
      statusRef.current.style.setProperty("--status", "#E49B0F");
    }
    if (friend.status === "OFFLINE" || friend.status === "DO_NOT_DISTURB") {
      statusRef.current.style.setProperty("--status", "#D22B2B");
    }
    if (friend.status === "INVISIBLE") {
      statusRef.current.style.setProperty("--status", "#808080");
    }
    if (command === "DIRECT_MESSAGES") {
      setDate();
      if (!messageReceived.seen && messageReceived.author === friend.username) {
        lastMessageRef.current.style.fontWeight = "700";
        lastMessageRef.current.style.color = "var(--navy)";
      }
    }
  }, []);

  // Shows profile for the friend that was clicked on
  const showFriend = (e, where) => {
    let parent;
    let username;

    if (where === "main") {
      parent = e.target.parentElement.parentElement;
      username = parent.children[1].children[0].textContent;
    }
    if (where === "icon") {
      parent = e.target.parentElement.parentElement;
      username = parent.children[1].children[0].textContent;
    }
    if (where === "username") {
      username = e.target.textContent;
    }

    axios
      .get(`${process.env.REACT_APP_URL}friendship/show-friend/${username}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((res) => {
        if (res.data.status === "FAILED") return;
        setProfile(res.data.friend);
        setShowProfile(true);
      })
      .catch((error) => console.log(error));
  };

  // Handles deletion of friend on click
  const deleteFriend = (e) => {
    const parent = e.target.parentElement.parentElement;
    const deleteId = parent.dataset.friendship;

    axios
      .delete(`${process.env.REACT_APP_URL}friendship/delete/${deleteId}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((res) => {
        if (res.data.status === "FAILED") {
          console.log(res.data.message);
          return;
        }
        // Remove deleted friend from state holding friends
        const filteredFriends = friends.filter((friend) => {
          if (friend.id.toString() !== deleteId) return friend;
        });
        setFriends(filteredFriends);
      })
      .catch((error) => console.log(error));
  };

  // Lets other user now that u are in the chat
  const joinChatRoom = async () => {
    await socket.emit("join_room", {
      to: friend.username,
      from: authState.username,
    });
    if (!messageReceived.seen) {
      await socket.emit("seen", {
        to: friend.username,
        from: authState.username,
      });
    }
    navigate(`/chatroom/${friend.username}`);
  };

  // Helper function that will set date of the last message sent
  const setDate = () => {
    const todayDate = new Date();
    if (lastMessage[0]) {
      const messageDate = new Date(lastMessage[0].createdAt);
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
    }
  };

  const goToChat = async (e) => {
    await socket.emit("join_room", {
      to: friend.username,
      from: authState.username,
    });
    if (!messageReceived.seen) {
      await socket.emit("seen", {
        to: friend.username,
        from: authState.username,
      });
    }
    const username =
      e.target.children[0].children[0].children[2].children[0].children[0]
        .textContent;
    navigate(`/chatroom/${username}`);
  };

  return (
    <section
      ref={statusRef}
      id="friend"
      onClick={(e) => command === "DIRECT_MESSAGES" && goToChat(e)}
      className={command === "DIRECT_MESSAGES" ? "all" : undefined}
    >
      <div className="container">
        <div className="friend" data-friendship={id}>
          {command === "DIRECT_MESSAGES" && (
            <p className="last-message-date">{time}</p>
          )}
          <article className={command === "GROUP_CHATS" ? "img1" : "img"}>
            <FaUserCircle
              className="profile-icon"
              onClick={(e) => command === "FRIENDS" && showFriend(e, icon)}
            />
          </article>
          <article className="username">
            <div className="header">
              <h1
                onClick={(e) =>
                  command === "FRIENDS" && showFriend(e, "username")
                }
              >
                {friend.username}
              </h1>
            </div>
            {command === "FRIENDS" && friend.name !== "" && (
              <p>{friend.name}</p>
            )}
            {command === "DIRECT_MESSAGES" && lastMessage[0] && (
              <p ref={lastMessageRef} className="last-message">
                {lastMessage[0].author === authState.username
                  ? `You: ${lastMessage[0].message}`
                  : lastMessage[0].message}
              </p>
            )}
          </article>
          <article
            className={`btn-container ${
              command === "DIRECT_MESSAGES" ? "hide" : undefined
            }`}
          >
            <div onClick={(e) => showFriend(e, "main")}>
              <FaUser />
            </div>
            <div onClick={joinChatRoom}>
              <FaComment />
            </div>
            <div onClick={(e) => deleteFriend(e)}>
              <FaTrash />
            </div>
          </article>
        </div>
      </div>
      <section
        id="profile-modal"
        className={`page ${showProfile ? "active" : undefined}`}
      >
        <ProfileModal
          {...profile}
          setShowProfile={setShowProfile}
          showProfile={showProfile}
        />
      </section>
    </section>
  );
};

export default Friend;
