import React, { useState, useEffect, useRef } from 'react'
import { FaTimes, FaUserCircle, FaUserEdit, FaAt, FaLocationArrow, FaMapPin, FaUserCheck } from 'react-icons/fa'

const ProfileModal = ({ showProfile, setShowProfile, username, id, name, verified, email, country, city, createdAt, status }) => {
  const statusRef=useRef()

  useEffect(() => {
    if(!showProfile) return
    if(status==='ONLINE') {
      statusRef.current.style.setProperty('--status', '#228b22')
    }
    if(status==='IDLE') {
      statusRef.current.style.setProperty('--status', '#E49B0F')
    }
    if(status==='OFFLINE' || status==='DO_NOT_DISTURB') {
      statusRef.current.style.setProperty('--status', '#D22B2B')
    }
    if(status==='INVISIBLE') {
      statusRef.current.style.setProperty('--status', '#808080')
    }
  }, [showProfile])

  return (
    <div ref={statusRef} className="container">
      <article className="overlay" onClick={() => setShowProfile(false)}></article>
      <article className='modal'>
        <div className="close-btn" onClick={() => setShowProfile(false)}><FaTimes/></div>
        <article className="profile-img">
          <div className="img-container">
            <FaUserCircle className='profile-icon'/>
          </div>
          <div className="header">
            <h1>{username} #{id}</h1>
          </div>
        </article>
        <article className="user-info">
          <ul>
            <li>
              <div>
                <span><FaUserEdit/></span>
                <span>Name</span>
              </div>
              <div>
                <span className='capitalize'>{name}</span>
              </div>
            </li>
            {verified &&
            <li>
              <div>
                <span><FaAt/></span>
                <span>Email</span>
              </div>
              <div>
                <span className='email'>{email}</span>
              </div>
            </li>}
            <li>
              <div>
                <span><FaLocationArrow/></span>
                <span>Country</span>
              </div>
              <div>
                <span className='capitalize'>{country}</span>
              </div>
            </li>
            <li>
              <div>
                <span><FaMapPin/></span>
                <span>City</span>
              </div>
              <div>
                <span className='capitalize'>{city}</span>
              </div>
            </li>
            <li>
              <div>
                <span><FaUserCheck/></span>
                <span>Member Since</span>
              </div>
              <div>
                <span>{createdAt && createdAt.split('T', 2)[0]}</span>
              </div>
            </li>
          </ul>
        </article>
      </article>
    </div>
  )
}

export default ProfileModal