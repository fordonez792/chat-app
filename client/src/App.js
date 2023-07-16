import "./style.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/home/Home";
import ChatRoom from "./components/ChatRoom";
import GroupChatRoom from "./pages/groupChats/GroupChatRoom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmailVerification from "./components/EmailVerification";
import Error from "./pages/Error";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/chatroom/:room" element={<ChatRoom />} />
        <Route
          exact
          path="/groupchatroom/:name/:id"
          element={<GroupChatRoom />}
        />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/signup" element={<Signup />} />
        <Route
          exact
          path="/userVerification/:id/:token"
          element={<EmailVerification />}
        />
        <Route path="*" element={<Error />} />
      </Routes>
    </Router>
  );
};

export default App;
