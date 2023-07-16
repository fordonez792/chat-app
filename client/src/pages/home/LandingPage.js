import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaLock,
  FaUserPlus,
  FaUsers,
  FaArrowLeft,
  FaChevronRight,
} from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleJoinUs = () => {
    navigate("/login");
  };

  return (
    <>
      <article className="navbar">
        <div className="header">
          <h1>ChatX</h1>
        </div>
        <div className="nav-options">
          <button onClick={handleJoinUs}>Join Us</button>
        </div>
      </article>
      <article className="advertisement">
        <div className="info-container">
          <h1>
            Chat Easy, Chat Secure, Chat Live Time, <span>ChatX</span>
          </h1>
          <button onClick={handleJoinUs}>Join Us</button>
        </div>
        <div className="phone-container">
          <div className="phone">
            <div className="screen"></div>
            <div className="container">
              <section className="chat-design">
                <article className="navbar">
                  <div className="go-back">
                    <FaArrowLeft />
                  </div>
                  <div className="header">
                    <h1>Fernando</h1>
                  </div>
                </article>
                <article className="chat-container">
                  <div className="message mine">
                    <p className="content1 first"></p>
                  </div>
                  <div className="message mine">
                    <p className="content1 second"></p>
                  </div>
                  <div className="message">
                    <p className="content1 third"></p>
                  </div>
                  <div className="message">
                    <p className="content1 fourth"></p>
                  </div>
                  <div className="message">
                    <p className="content1 fifth"></p>
                  </div>
                  <div className="message mine">
                    <p className="content1 sixth"></p>
                  </div>
                  <div className="message mine">
                    <p className="content1 seventh"></p>
                  </div>
                  <div className="typing content1">
                    <div className="container">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                </article>
                <article className="send-message">
                  <div className="form-container">
                    <div className="message-input"></div>
                    <button>
                      <FaChevronRight />
                    </button>
                  </div>
                </article>
              </section>
            </div>
          </div>
        </div>
      </article>
      <article className="features">
        <div className="header">
          <h1>Features</h1>
        </div>
        <div className="good-features">
          <article className="single-feature">
            <div className="icon">
              <FaLock />
            </div>
            <div className="info">
              <h3>Secure Platform</h3>
              <p>Security is guaranteed for all your information</p>
            </div>
          </article>
          <article className="single-feature">
            <div className="icon">
              <FaUserPlus />
            </div>
            <div className="info">
              <h3>Private Chat Rooms</h3>
              <p>Receive and send messages in live time to your friends</p>
            </div>
          </article>
          <article className="single-feature">
            <div className="icon">
              <FaUsers />
            </div>
            <div className="info">
              <h3>Group Chat Rooms</h3>
              <p>Communicate with many people at the same time</p>
            </div>
          </article>
        </div>
      </article>
    </>
  );
};

export default LandingPage;
