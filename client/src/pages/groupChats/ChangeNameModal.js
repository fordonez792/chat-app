import axios from "axios";
import React, { useState } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";

const ChangeNameModal = ({ setIsNameOpen, id, setGCName }) => {
  const [message, setMessage] = useState("");
  const [newName, setNewName] = useState("");

  const closeModal = (e) => {
    e?.preventDefault();
    setMessage("");
    setNewName("");
    setIsNameOpen(false);
  };

  const changeName = (e) => {
    e.preventDefault();
    if (newName === "") {
      setMessage("New name can't be empty.");
      return;
    }
    axios
      .put(
        `${process.env.REACT_APP_URL}group-chats/change-name`,
        { name: newName, id },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then((res) => {
        if (res.data.status === "FAILED") {
          setMessage(res.data.message);
        }
        setGCName(res.data.newName);
        closeModal();
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="container">
      <article className="overlay" onClick={(e) => closeModal(e)}></article>
      <article className="modal">
        <div className="close-btn" onClick={(e) => closeModal(e)}>
          <FaTimes />
        </div>
        <div className="header">
          <h1>Change Group Chat Name</h1>
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
              name="name"
              placeholder="Name"
              className="input-field"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div className="btn-container">
            <button className="cancel" onClick={(e) => closeModal(e)}>
              Cancel
            </button>
            <button type="submit" onClick={(e) => changeName(e)}>
              Update
            </button>
          </div>
        </form>
      </article>
    </div>
  );
};

export default ChangeNameModal;
