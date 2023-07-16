import React, { useState, useEffect } from "react";
import { FaComments } from "react-icons/fa";
import axios from "axios";

import GroupChatsModal from "./GroupChatsModal";
import GroupChat from "./GroupChat";

const GroupChats = () => {
  const [groupChats, setGroupChats] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_URL}group-chats/get-group-chats`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((res) => {
        if (res.data.status === "SUCCESS") {
          setGroupChats(res.data.updatedChats);
        }
        if (res.data.status === "FAILED") console.log(res.data.message);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <section className="page" id="group-chats">
      <div className="container">
        <article className="navbar">
          <div className="header">
            <h1>Group Chats</h1>
          </div>
          <div className="join-room-btn" onClick={() => setIsOpen(true)}>
            <FaComments />
          </div>
        </article>
        <article className="group-chats-container">
          {groupChats.length > 0 ? (
            groupChats.map((chat, index) => {
              return <GroupChat key={index} {...chat} />;
            })
          ) : (
            <article className="start-group-chats">
              <div className="header">
                <h1>No Group Chats Found</h1>
              </div>
            </article>
          )}
        </article>
      </div>
      <section id="edit-info" className={`page ${isOpen && "active"}`}>
        <GroupChatsModal
          setIsOpen={setIsOpen}
          setGroupChats={setGroupChats}
          groupChats={groupChats}
        />
      </section>
    </section>
  );
};

export default GroupChats;
