import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import axios from "axios";

import { useHomeContext } from "../../context/homeContext";
import { useMyContext } from "../../context/context";
import useDebounce from "../../hooks/useDebounce";

const FriendsModal = ({ setIsOpen }) => {
  const { socket, authState } = useMyContext();
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState();
  const messageRef = useRef();
  const inputRef = useRef();

  const debouncedValue = useDebounce(search, 1000);

  const closeModal = (e) => {
    e.preventDefault();
    setIsOpen(false);
    setSearch("");
    setMessage("");
  };

  const sendRequest = async (e) => {
    e.preventDefault();
    setMessage("");
    if (user == null) {
      setMessage("Please enter an existing username or wait a moment");
      return;
    }
    await socket.emit("friend_request", { to: user[0].id.toString() });
    closeModal(e);
  };

  useEffect(() => {
    if (debouncedValue === "") return;
    axios
      .get(`http://localhost:3001/users/find/?search=${debouncedValue}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((res) => {
        if (res.data.status === "FAILED") {
          messageRef.current.style.setProperty("--color", "#D22B2B");
        }
        if (res.data.user) {
          setUser(res.data.user);
          messageRef.current.style.setProperty("--color", "#228b22");
        }
        setMessage(res.data.message);
      })
      .catch((error) => console.log(error));
  }, [debouncedValue]);

  useEffect(() => {
    inputRef.current.focus();
  });

  return (
    <div className="container">
      <article className="overlay" onClick={(e) => closeModal(e)}></article>
      <article className="modal">
        <div className="close-btn" onClick={(e) => closeModal(e)}>
          <FaTimes />
        </div>
        <div className="header">
          <h1>Add New Friend</h1>
        </div>
        <form className="form-container">
          <div ref={messageRef} className="error-container">
            {message !== "" && <span>{message}</span>}
          </div>

          <div className="field-container">
            <label>
              <FaSearch />
            </label>
            <input
              ref={inputRef}
              autoComplete="off"
              name="username"
              placeholder="Username"
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="btn-container">
            <button className="cancel" onClick={(e) => closeModal(e)}>
              Cancel
            </button>
            <button type="submit" onClick={(e) => sendRequest(e)}>
              Send
            </button>
          </div>
        </form>
      </article>
    </div>
  );
};

export default FriendsModal;
