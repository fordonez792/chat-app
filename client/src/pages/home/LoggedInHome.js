import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaComments, FaSmile, FaUsers } from "react-icons/fa";
import axios from "axios";

import { useHomeContext } from "../../context/homeContext";
import { useMyContext } from "../../context/context";
import { useSocketContext } from "../../context/socketContext";

import DirectMessages from "../DirectMessages";
import Profile from "../profile/Profile";
import GroupChats from "../groupChats/GroupChats";
import Friends from "../friends/Friends";

const LoggedInHome = () => {
  const { socket } = useMyContext();
  const {
    requestReceived,
    setRequestReceived,
    messageReceived,
    setMessageReceived,
    messageReceivedGC,
    setMessageReceivedGC,
  } = useSocketContext();
  const { setFriends } = useHomeContext();
  const [component, setComponent] = useState(0);
  const [click, setClick] = useState(false);
  const menuRef = useRef([]);

  const helper = (id) => {
    menuRef.current.forEach((item) => {
      item.classList.remove("active");
    });
    menuRef.current[id].classList.add("active");
    setComponent(id);
  };

  useEffect(() => {
    setComponent(0);
    menuRef.current[0].classList.add("active");
  }, []);

  useEffect(() => {
    if (requestReceived) menuRef.current[2].classList.add("received");
    else menuRef.current[2].classList.remove("received");
  }, [requestReceived]);

  useEffect(() => {
    if (messageReceivedGC.received)
      menuRef.current[1].classList.add("received");
    else menuRef.current[1].classList.remove("received");
  }, [messageReceivedGC]);

  useEffect(() => {
    if (messageReceived.received) menuRef.current[0].classList.add("received");
    else menuRef.current[0].classList.remove("received");
  }, [messageReceived]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_URL}friendship/friends`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((res) => {
        if (res.data.status === "SUCCESS") {
          setFriends(res.data.friends);
        }
        if (res.data.status === "FAILED") console.log(res.data.message);
      })
      .catch((error) => console.log(error));
  }, [click]);

  const friendsClick = (id) => {
    helper(id);
    setClick(!click);
  };

  return (
    <>
      <article className="content">
        {component === 0 && <DirectMessages />}
        {component === 1 && <GroupChats />}
        {component === 2 && <Friends />}
        {component === 3 && <Profile />}
      </article>
      <footer>
        <button
          ref={(el) => (menuRef.current[0] = el)}
          onClick={() => helper(0)}
          className="nav-option"
        >
          <FaComments />
        </button>
        <button
          ref={(el) => (menuRef.current[1] = el)}
          onClick={() => helper(1)}
          className="nav-option"
        >
          <FaUsers />
        </button>
        <button
          ref={(el) => (menuRef.current[2] = el)}
          onClick={() => friendsClick(2)}
          className="nav-option"
        >
          <FaUserCircle />
        </button>
        <button
          ref={(el) => (menuRef.current[3] = el)}
          onClick={() => helper(3)}
          className="nav-option"
        >
          <FaSmile />
        </button>
      </footer>
    </>
  );
};

export default LoggedInHome;
