import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaEdit, FaUserCircle, FaCheck } from "react-icons/fa";
import axios from "axios";

import { useMyContext } from "../../context/context";
import { useHomeContext } from "../../context/homeContext";

const GroupChatsModal = ({ setIsOpen, setGroupChats, groupChats }) => {
  const { socket } = useMyContext();
  const { friends } = useHomeContext();
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [selectedFriendsId, setSelectedFriendsId] = useState([]);
  const ulRef = useRef();

  const closeModal = (e) => {
    e.preventDefault();
    Array.from(ulRef.current.children).forEach((li) => {
      if (li.children[0]) li.children[0].checked = false;
    });
    setSelectedFriendsId([]);
    setRoom("");
    setMessage("");
    setIsOpen(false);
  };

  const createRoom = (e) => {
    e.preventDefault();
    if (selectedFriendsId.length < 2) {
      setMessage("Select at least 2 friends");
      return;
    }
    if (selectedFriendsId.length > 10) {
      setMessage("Max Group Chat Members is 10");
      return;
    }
    if (room === "") {
      setMessage("Room name can't be empty");
      return;
    }
    axios
      .post(
        `${process.env.REACT_APP_URL}group-chats/create`,
        { selectedFriendsId: selectedFriendsId.toString(), name: room },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then(async (res) => {
        if (res.data.status === "FAILED") {
          console.log(res.data.message);
          return;
        }
        await socket.emit("new_group_chat", {
          newGroupChat: res.data.newGroupChat,
        });
        setGroupChats([res.data.newGroupChat, ...groupChats]);
      })
      .catch((error) => {
        console.log(error);
      });
    closeModal(e);
  };

  const updateList = (e, friend) => {
    if (e.target.checked) {
      setSelectedFriendsId([...selectedFriendsId, friend.friend.id]);
    }
    if (!e.target.checked) {
      const update = selectedFriendsId.filter((id) => {
        if (id !== friend.friend.id) return id;
      });
      setSelectedFriendsId(update);
    }
  };

  return (
    <div className="container">
      <article className="overlay" onClick={(e) => closeModal(e)}></article>
      <article className="modal">
        <div className="close-btn" onClick={(e) => closeModal(e)}>
          <FaTimes />
        </div>
        <div className="header">
          <h1>Create a Room</h1>
        </div>
        <form className="form-container">
          <div className="error-container">
            {message !== "" && <span>{message}</span>}
          </div>

          <div className="field-container">
            <label>
              <FaEdit />
            </label>
            <input
              autoComplete="off"
              name="room"
              placeholder="Room"
              className="input-field"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>

          <ul ref={ulRef} className="friends-container">
            <span
              className={selectedFriendsId.length > 10 ? "overflow" : null}
            >{`Members Selected: ${selectedFriendsId.length}/10`}</span>
            {friends.length > 0 &&
              friends.map((friend, index) => {
                return (
                  <li key={index}>
                    <input
                      type="checkbox"
                      onClick={(e) => updateList(e, friend)}
                    />
                    <FaCheck className="check" />
                    <label>
                      <article className="img">
                        <FaUserCircle className="profile-icon" />
                      </article>
                      <article className="username">
                        <div className="header">
                          <h1>
                            {friend.friend.username && friend.friend.username}
                          </h1>
                        </div>
                      </article>
                    </label>
                  </li>
                );
              })}
          </ul>

          <div className="btn-container">
            <button className="cancel" onClick={(e) => closeModal(e)}>
              Cancel
            </button>
            <button type="submit" onClick={(e) => createRoom(e)}>
              Create
            </button>
          </div>
        </form>
      </article>
    </div>
  );
};

export default GroupChatsModal;
