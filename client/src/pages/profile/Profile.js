import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../../context/context";
import {
  FaLock,
  FaUserCircle,
  FaSun,
  FaUser,
  FaAt,
  FaMapPin,
  FaLocationArrow,
  FaUserEdit,
  FaUserCheck,
  FaChevronRight,
  FaCheck,
} from "react-icons/fa";
import axios from "axios";

import useDebounce from "../../hooks/useDebounce";
import EditInfoModal from "./EditInfoModal";

const status = ["Online", "Idle", "Do Not Disturb", "Invisible"];

const Profile = () => {
  const navigate = useNavigate();
  const { authState, setAuthState } = useMyContext();
  const statusRef = useRef();
  const [statusIndex, setStatusIndex] = useState(-1);
  const [userInfo, setUserInfo] = useState({});
  const [editInfo, setEditInfo] = useState({ title: "", value: "" });
  const [isOpen, setIsOpen] = useState(false);

  const debouncedStatus = useDebounce(statusIndex, 1000);

  useEffect(() => {
    let newStatus;
    if (debouncedStatus === -1) return;
    if (debouncedStatus === 0) newStatus = "ONLINE";
    if (debouncedStatus === 1) newStatus = "IDLE";
    if (debouncedStatus === 2) newStatus = "DO_NOT_DISTURB";
    if (debouncedStatus === 3) newStatus = "INVISIBLE";
    axios
      .put(
        `${process.env.REACT_APP_URL}users/update-status`,
        { newStatus },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .catch((error) => console.log(error));
  }, [debouncedStatus]);

  useEffect(() => {
    if (!authState.status) navigate("/");
    else {
      axios
        .get(`${process.env.REACT_APP_URL}users/profile`, {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((res) => {
          setUserInfo(res.data);
          if (res.data.status === "ONLINE") setStatusIndex(0);
          if (res.data.status === "IDLE") setStatusIndex(1);
          if (
            res.data.status === "OFFLINE" ||
            res.data.status === "DO_NOT_DISTURB"
          )
            setStatusIndex(2);
          if (res.data.status === "INVISIBLE") setStatusIndex(3);
        })
        .catch((err) => console.log(err));
    }
  }, []);

  const openModal = (e) => {
    const parent = e.parentElement.parentElement;

    const title = parent.children[0].children[1].textContent;
    const value = parent.children[1].children[0].textContent;
    setEditInfo({ title, value });
    setIsOpen(true);
  };

  const handleStatusIndex = (index) => {
    if (index > 3) setStatusIndex(0);
    else {
      setStatusIndex(index);
    }
  };

  useEffect(() => {
    // sets color and position of little bubble according to status
    if (statusIndex === 0) {
      statusRef.current.style.setProperty("--status", "#228b22");
      statusRef.current.style.setProperty("--left", "73%");
    }
    if (statusIndex === 1) {
      statusRef.current.style.setProperty("--status", "#E49B0F");
      statusRef.current.style.setProperty("--left", "75%");
    }
    if (statusIndex === 2) {
      statusRef.current.style.setProperty("--status", "#D22B2B");
      statusRef.current.style.setProperty("--left", "52%");
    }
    if (statusIndex === 3) {
      statusRef.current.style.setProperty("--status", "#808080");
      statusRef.current.style.setProperty("--left", "65%");
    }
  }, [statusIndex]);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({
      username: "",
      id: 0,
      status: false,
    });
  };

  return (
    <section id="profile" className="page">
      <div ref={statusRef} className="container">
        <article className="profile-img">
          <div className="img-container">
            <FaUserCircle className="profile-icon" />
          </div>
          <div className="header">
            <h1>
              {userInfo.username} #{userInfo.id}
            </h1>
          </div>
        </article>
        <article className="user-info">
          <ul>
            <li>
              <div>
                <span>
                  <FaSun />
                </span>
                <span>Set Status</span>
              </div>
              <div>
                <span>{status[statusIndex]}</span>
                <span
                  className="edit"
                  onClick={() => handleStatusIndex(statusIndex + 1)}
                >
                  <FaChevronRight />
                </span>
              </div>
            </li>
            <li>
              <div>
                <span>
                  <FaUser />
                </span>
                <span>Username</span>
              </div>
              <div>
                <span>{userInfo.username}</span>
                <span className="edit" onClick={(e) => openModal(e.target)}>
                  <FaChevronRight />
                </span>
              </div>
            </li>
            <li>
              <div>
                <span>
                  <FaUserEdit />
                </span>
                <span>Name</span>
              </div>
              <div>
                <span className="capitalize">{userInfo.name}</span>
                <span className="edit" onClick={(e) => openModal(e.target)}>
                  <FaChevronRight />
                </span>
              </div>
            </li>
            <li>
              <div>
                <span>
                  <FaAt />
                </span>
                <span>Email</span>
              </div>
              <div>
                {userInfo.verified && (
                  <span className="verified">
                    <FaCheck />
                  </span>
                )}
                <span className="email">
                  {userInfo.email &&
                    `**********@${userInfo.email.split("@", 2)[1]}`}
                </span>
                <span className="edit" onClick={(e) => openModal(e.target)}>
                  <FaChevronRight />
                </span>
              </div>
            </li>
            <li>
              <div>
                <span>
                  <FaLocationArrow />
                </span>
                <span>Country</span>
              </div>
              <div>
                <span className="capitalize">{userInfo.country}</span>
                <span className="edit" onClick={(e) => openModal(e.target)}>
                  <FaChevronRight />
                </span>
              </div>
            </li>
            <li>
              <div>
                <span>
                  <FaMapPin />
                </span>
                <span>City</span>
              </div>
              <div>
                <span className="capitalize">{userInfo.city}</span>
                <span className="edit" onClick={(e) => openModal(e.target)}>
                  <FaChevronRight />
                </span>
              </div>
            </li>
            <li>
              <div>
                <span>
                  <FaLock />
                </span>
                <span>Change Password</span>
              </div>
              <div>
                <span></span>
                <span className="edit" onClick={(e) => openModal(e.target)}>
                  <FaChevronRight />
                </span>
              </div>
            </li>
            <li>
              <div>
                <span>
                  <FaUserCheck />
                </span>
                <span>Member Since</span>
              </div>
              <div>
                <span>
                  {userInfo.createdAt && userInfo.createdAt.split("T", 2)[0]}
                </span>
              </div>
            </li>
            <button onClick={logout}>Logout</button>
          </ul>
        </article>
      </div>
      <section id="edit-info" className={`page ${isOpen && "active"}`}>
        <EditInfoModal
          {...editInfo}
          setUserInfo={setUserInfo}
          setIsOpen={setIsOpen}
          logout={logout}
        />
      </section>
    </section>
  );
};

export default Profile;
