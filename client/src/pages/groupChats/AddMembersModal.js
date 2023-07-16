import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaCheck, FaUserCircle } from "react-icons/fa";

const AddMembersModal = ({ setIsOpen, id, members, setMembers }) => {
  const ulRef = useRef();
  const [message, setMessage] = useState("");
  const [selectedFriendsId, setSelectedFriendsId] = useState([]);
  const [friends, setFriends] = useState([]);

  const closeModal = (e) => {
    e.preventDefault();
    setMessage("");
    setIsOpen(false);
  };

  const updateList = (e, friend) => {
    if (e.target.checked) {
      setSelectedFriendsId([...selectedFriendsId, friend.id]);
    }
    if (!e.target.checked) {
      const update = selectedFriendsId.filter((id) => {
        if (id !== friend.id) return id;
      });
      setSelectedFriendsId(update);
    }
  };

  const addMemberToGroupChat = (e) => {
    e.preventDefault();
    if (selectedFriendsId.length < 1) {
      setMessage("Select at least 1 friend");
      return;
    }
    axios
      .post(
        `${process.env.REACT_APP_URL}group-chats/add-member`,
        { selectedFriendsId: selectedFriendsId.toString(), groupChatId: id },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then((res) => {
        if (res.data.status === "SUCCESS") {
          for (const member of res.data.newMembers) {
            setMembers([...members, member]);
          }
          setSelectedFriendsId([]);
          closeModal(e);
        }
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_URL}group-chats/get-missing-friends/${id}`,
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        }
      )
      .then((res) => {
        if (res.data.status === "FAILED") {
          setMessage(res.data.message);
        } else {
          setFriends(res.data.missingFriends);
        }
      })
      .catch((error) => console.log(error));
  }, [id]);

  return (
    <div className="container">
      <article className="overlay" onClick={(e) => closeModal(e)}></article>
      <article className="modal">
        <div className="close-btn" onClick={(e) => closeModal(e)}>
          <FaTimes />
        </div>
        <div className="header">
          <h1>Add Friends</h1>
        </div>
        <form className="form-container">
          <div className="error-container">
            {message !== "" && <span>{message}</span>}
          </div>

          {friends.length > 0 && (
            <ul ref={ulRef} className="friends-container">
              <span
                className={selectedFriendsId.length > 10 ? "overflow" : null}
              >{`Members Selected: ${selectedFriendsId.length}/10`}</span>
              {friends?.length > 0 &&
                friends?.map((friend, index) => {
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
                            <h1>{friend.username && friend.username}</h1>
                          </div>
                        </article>
                      </label>
                    </li>
                  );
                })}
            </ul>
          )}

          <div className="btn-container">
            <button className="cancel" onClick={(e) => closeModal(e)}>
              Cancel
            </button>
            {friends.length > 0 && (
              <button type="submit" onClick={(e) => addMemberToGroupChat(e)}>
                Add
              </button>
            )}
          </div>
        </form>
      </article>
    </div>
  );
};

export default AddMembersModal;
