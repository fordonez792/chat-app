import React, { useState, useEffect } from "react";
import { FaUserPlus } from "react-icons/fa";
import axios from "axios";

import { useHomeContext } from "../../context/homeContext";

import FriendsModal from "./FriendsModal";
import FriendRequest from "./FriendRequest";
import Friend from "../../components/Friend";

const Friends = () => {
  const { friendRequests, setFriendRequests, friends, setFriends } =
    useHomeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState("FRIENDS");

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_URL}friendship/get-friend-requests`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((res) => {
        if (res.data.status === "SUCCESS") setFriendRequests(res.data.requests);
        if (res.data.status === "FAILED") console.log(res.data.message);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <section id="friends" className="page">
      <div className="container">
        <article className="navbar">
          <div className="header">
            <h1>Friends</h1>
          </div>
          <div className="add-new-friend" onClick={() => setIsOpen(true)}>
            <FaUserPlus />
          </div>
        </article>
        <article className="friends-container">
          {friendRequests.length < 1 && friends.length < 1 && (
            <article className="find-friends">
              <div className="header">
                <h1>Find Some Friends</h1>
              </div>
              <button onClick={() => setIsOpen(true)}>Add Friends</button>
            </article>
          )}

          {friendRequests.length > 0 && (
            <article className="requests">
              <div className="header">
                <h1>
                  Friend Requests (
                  <span>{friendRequests.length && friendRequests.length}</span>)
                </h1>
              </div>
              <div className="friend-request-container">
                {friendRequests.map((request, index) => {
                  return <FriendRequest key={index} {...request} />;
                })}
              </div>
            </article>
          )}
          {friends.length > 0 && (
            <article className="contacts">
              <div className="header">
                <h1>
                  Friends (<span>{friends.length}</span>)
                </h1>
              </div>
              <div className="friend-container">
                {friends.map((friend, index) => {
                  return <Friend key={index} {...friend} command={command} />;
                })}
              </div>
            </article>
          )}
        </article>
      </div>
      <section id="edit-info" className={`page ${isOpen && "active"}`}>
        <FriendsModal setIsOpen={setIsOpen} />
      </section>
    </section>
  );
};

export default Friends;
