import React, { useState, useEffect } from "react";
import axios from "axios";

import Friend from "../components/Friend";

const DirectMessages = () => {
  const [chats, setChats] = useState([]);
  const [command, setCommand] = useState("DIRECT_MESSAGES");

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_URL}friendship/chats`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((res) => {
        if (res.data.status === "FAILED") {
          console.log(res.data.message);
          return;
        }
        if (res.data.status === "SUCCESS") {
          res.data.chats && setChats(res.data.chats);
        }
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <section className="page" id="direct-messages">
      <div className="container">
        <article className="navbar">
          <div className="header">
            <h1>Direct Messages</h1>
          </div>
        </article>
        <article className="chats-container">
          {chats.length > 0 ? (
            <article className="chats">
              <div className="active-chats-container">
                {chats.map((chat, index) => {
                  return <Friend key={index} {...chat} command={command} />;
                })}
              </div>
            </article>
          ) : (
            <article className="start-chats">
              <div className="header">
                <h1>No chats found</h1>
              </div>
            </article>
          )}
        </article>
      </div>
    </section>
  );
};

export default DirectMessages;
