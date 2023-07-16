import React, { useState, useEffect } from 'react'
import { FaUserCircle, FaCheck, FaTimes } from 'react-icons/fa'
import { useMyContext } from '../../context/context'
import { useHomeContext } from '../../context/homeContext'
import axios from 'axios'

const FriendRequest = ({ fromUser, toUserId, id }) => {
  const { socket, authState }=useMyContext()
  const { friendRequests, setFriendRequests, setFriends, friends }=useHomeContext()

  // Handles request being accepted, filtering and adding to friends
  const accept = async(e) => {
    axios
      .put(`${process.env.REACT_APP_URL}friendship/accept`,
      { fromUser, toUserId, id },
      { headers: { accessToken: localStorage.getItem('accessToken') } })
      .then(res => {
        if(res.data.status==='FAILED') {
          console.log(res.data.message)
          return
        }
        if(authState.id!==res.data.toUserId) return
        filterFriendRequests(e)
        const tempFriend={ id, friend: fromUser }
        setFriends([...friends, tempFriend])
      })
      .catch(error => console.log(error))
  }

  // Handles rejection of requests just filtering the requests
  const reject = async(e) => {
    axios
      .delete(`${process.env.REACT_APP_URL}friendship/reject/${id}`,
      { headers: { accessToken: localStorage.getItem('accessToken') } })
      .then(res => {
        if(res.data.status==='FAILED') {
          console.log(res.data.message)
          return
        }
        filterFriendRequests(e)
      })
  }

  // Helper function to filter the friend requests
  const filterFriendRequests = (e) => {
    const deleteId=e.target.parentElement.parentElement.id
    const filteredRequests=friendRequests.filter(request => {
      if(request.id.toString()!==deleteId) return request
    })
    setFriendRequests(filteredRequests)
  }

  return (
    <section id="friend-request">
      <div className="container">
        <div className="request" id={id}>
          <article className="img">
            <FaUserCircle className='profile-icon'/>
          </article>
          <article className="username">
            <div className="header">
              <h1>{fromUser.username}</h1>
            </div>
            <p>Incoming Friend Request</p>
          </article>
          <article className="btn-container">
            <div onClick={e => accept(e)} className='accept'><FaCheck/></div>
            <div onClick={e => reject(e)} className='reject'><FaTimes/></div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default FriendRequest