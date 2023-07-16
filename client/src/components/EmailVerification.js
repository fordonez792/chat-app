import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { useMyContext } from '../context/context'
import axios from 'axios'

const EmailVerification = () => {
  const navigate=useNavigate()
  const { id, token }=useParams()
  const { setAuthState }=useMyContext()
  const [verified, setVerified]=useState(false)

  useEffect(() => {
    axios
      .post(`${process.env.REACT_APP_URL}user-verification/verify-email-token`, { id, token })
      .then(res => {
        if(res.data.status==='FAILED') setVerified(false)
        else setVerified(true)
      })
      .catch(error => alert(error))
      .finally(() => {
        localStorage.removeItem('accessToken')
        setAuthState({
          username: '',
          id: 0,
          status: false
        })
      })
  }, [])

  return (
    <section id="email-verification" className="page">
      <div className="container">
        <article className='message'>
          <div className='status'>
            <div className={`icon ${verified ? 'success' : 'error'}`}>
              {verified ? <FaCheckCircle/> : <FaTimesCircle/>}
            </div>
            <div className="header">
              <h1>{verified ? 'Success' : 'Error'}</h1>
            </div>
          </div>
          <div className="status-message">
            {verified ?
            <p>Email has been verified successfully, please login again.</p>
            :
            <p>Could not verify email address or url has already expired, please login and try again.</p>}
            <button onClick={() => navigate('/login')}>{verified ? 'Login' : 'Try Again'}</button>
          </div>
        </article>
      </div>
    </section>
  )
}

export default EmailVerification