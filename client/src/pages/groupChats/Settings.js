import React, { useEffect, useState } from "react";
import { FaTimes, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GroupChatMember from "./GroupChatMember";
import AddMembersModal from "./AddMembersModal";
import ChangeNameModal from "./ChangeNameModal";

import { useMyContext } from "../../context/context";

const Settings = ({ setIsSettingsOpen, name, id }) => {
  const navigate = useNavigate();
  const { authState } = useMyContext();
  const [members, setMembers] = useState([]);
  const [creator, setCreator] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isNameOpen, setIsNameOpen] = useState(false);
  const [gcName, setGCName] = useState(name);

  const closeModal = (e) => {
    e?.preventDefault();
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_URL}group-chats/get-members/${id}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((res) => {
        if (res.data.status === "FAILED") {
          console.log(res.data.message);
          return;
        }
        if (res.data.status === "SUCCESS") {
          setMembers(res.data.gcMembers);
          setCreator(res.data.creator);
        }
      })
      .catch((error) => console.log(error));
  }, []);

  const addToGroup = (e) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const changeGroupChatName = (e) => {
    e.preventDefault();
    setIsNameOpen(true);
  };

  const leaveGroupChat = (e) => {
    e.preventDefault();
    axios
      .delete(
        `${process.env.REACT_APP_URL}group-chats/remove-member/${
          authState.id
        }/${id.toString()}`,
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        }
      )
      .then((res) => {
        if (res.data.status === "SUCCESS") {
          closeModal();
          navigate("/");
        }
      })
      .catch((error) => console.log(error));
  };

  const deleteGroupChat = (e) => {
    e.preventDefault();
    axios
      .delete(
        `${
          process.env.REACT_APP_URL
        }group-chats/delete-group-chat/${id.toString()}`,
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then((res) => {
        if (res.data.status === "SUCCESS") {
          closeModal();
          navigate("/");
        }
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
        <form className="form-container">
          {/* <div ref={messageRef} className="error-container">
            {message !== "" && <span>{message}</span>}
          </div> */}
          <article className="profile-img">
            <div className="img-container">
              <FaUserCircle className="profile-icon" />
            </div>
          </article>
          <div className="header">
            <h1>
              {gcName} #{id} Settings
            </h1>
          </div>

          <div className="change-name">
            <button onClick={(e) => changeGroupChatName(e)}>Change Name</button>
          </div>

          <div className="members">
            <div className="header">
              <h1>Members ({!members ? 1 : members?.length + 1})</h1>
            </div>
            <div className="members-container">
              <GroupChatMember
                {...creator}
                admin={true}
                creatorId={creator.id}
              />
              {members?.map((member, index) => {
                return (
                  <GroupChatMember
                    key={index}
                    {...member}
                    creatorId={creator.id}
                    setMembers={setMembers}
                    groupChatId={id}
                  />
                );
              })}
            </div>
          </div>

          <div className="btn-container">
            {creator.id === authState.id && (
              <button onClick={(e) => addToGroup(e)}>Add Friends</button>
            )}
            {creator.id !== authState.id ? (
              <button className="exit" onClick={(e) => leaveGroupChat(e)}>
                Leave Group Chat
              </button>
            ) : (
              <button className="exit" onClick={(e) => deleteGroupChat(e)}>
                Delete Group Chat
              </button>
            )}
          </div>
        </form>
      </article>
      <section id="edit-info" className={`page ${isNameOpen && "active"}`}>
        <ChangeNameModal
          setIsNameOpen={setIsNameOpen}
          id={id}
          setGCName={setGCName}
        />
      </section>
      <section id="edit-info" className={`page ${isOpen && "active"}`}>
        <AddMembersModal
          setIsOpen={setIsOpen}
          id={id}
          members={members}
          setMembers={setMembers}
        />
      </section>
    </div>
  );
};

export default Settings;
