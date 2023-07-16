import React, { useState, useEffect } from "react";
import {
  FaLock,
  FaTimes,
  FaRegEye,
  FaRegEyeSlash,
  FaUser,
  FaAt,
  FaMapPin,
  FaLocationArrow,
  FaUserEdit,
} from "react-icons/fa";
import axios from "axios";

import ChangePassword from "./ChangePassword";
import ChangeEmail from "./ChangeEmail";

const EditInfoModal = ({ title, value, setIsOpen, setUserInfo, logout }) => {
  const [newValue, setNewValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [viewPassword, setViewPassword] = useState(false);

  const closeModal = (e) => {
    if (e != null) e.preventDefault();
    setIsOpen(false);
    setNewValue("");
    setPassword("");
    setError("");
  };

  const updateInfo = (e) => {
    e.preventDefault();
    if (newValue === "") {
      setError(`${title} field can't be empty`);
      return;
    }
    axios
      .put(
        `${process.env.REACT_APP_URL}users/update-info`,
        { category: title.toLowerCase(), newValue, password },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then((res) => {
        if (res.data.error) setError(res.data.error);
        setUserInfo(res.data);
        closeModal(e);
      });
  };

  // Especial for change password as it requires to confirm new password
  if (title === "Change Password") {
    return <ChangePassword closeModal={closeModal} logout={logout} />;
  }

  if (title === "Email") {
    return (
      <ChangeEmail
        closeModal={closeModal}
        setUserInfo={setUserInfo}
        logout={logout}
      />
    );
  }

  // Will work for all inputs except the change password and email
  else
    return (
      <div className="container">
        <article className="overlay" onClick={(e) => closeModal(e)}></article>
        <article className="modal">
          <div className="close-btn" onClick={(e) => closeModal(e)}>
            <FaTimes />
          </div>
          <div className="header">
            <h1>
              {value ? "Change" : "Add"} your {title.toLowerCase()}
            </h1>
            <h2>
              Enter {value ? "a new" : "your"} {title.toLowerCase()} and your
              password
            </h2>
          </div>
          <form className="form-container">
            <div className="error-container">
              {error !== "" && <span>{error}</span>}
            </div>

            <div className="field-container">
              <label>
                {title === "Username" && <FaUser />}
                {title === "Name" && <FaUserEdit />}
                {title === "Email" && <FaAt />}
                {title === "Country" && <FaLocationArrow />}
                {title === "City" && <FaMapPin />}
              </label>
              <input
                autoComplete="off"
                name="username"
                placeholder={title}
                className="input-field"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>

            <div className="field-container">
              <label>
                <FaLock />
              </label>
              <input
                autoComplete="off"
                type={viewPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div
                className={`view-password ${password && "active"}`}
                onClick={() => setViewPassword(!viewPassword)}
              >
                {viewPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </div>
            </div>

            <div className="btn-container">
              <button className="cancel" onClick={(e) => closeModal(e)}>
                Cancel
              </button>
              <button type="submit" onClick={(e) => updateInfo(e)}>
                Done
              </button>
            </div>
          </form>
        </article>
      </div>
    );
};

export default EditInfoModal;
