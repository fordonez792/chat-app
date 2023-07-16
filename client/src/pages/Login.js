import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUserAlt, FaLock, FaRegEye, FaRegEyeSlash } from 'react-icons/fa'
import axios from 'axios'

import { useMyContext } from '../context/context'

const Login = () => {
  const navigate=useNavigate()
  const { setAuthState }=useMyContext()
  const [username, setUsername]=useState('')
  const [password, setPassword]=useState('')
  const [error, setError]=useState('')
  const [viewPassword, setViewPassword]=useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    axios
      .post(`${process.env.REACT_APP_URL}users/login`, { username, password })
      .then(res => {
        if(res.data.error) setError(res.data.error)
        else{
          localStorage.setItem('accessToken', res.data.accessToken)
          setAuthState({
            username: res.data.username,
            id: res.data.id,
            status: true,
          })
          navigate('/')
        }
      })
      .finally(() => setPassword(''))
  }

  return (
    <section className="page" id="login">
      <div className="container">
        <article className="login-container">
          <div className="header">
            <h1>Login</h1>
          </div>
          <form className="form-container" onSubmit={e => handleSubmit(e)}>
            <div className="error-container">
              {error!=='' && <span>{error}</span>}
            </div>

            <div className="field-container">
              <label><FaUserAlt/></label>
              <input autoComplete='off' name='username' placeholder='Username' className="input-field" value={username} onChange={e => setUsername(e.target.value)} />
            </div>

            <div className="field-container">
              <label><FaLock/></label>
              <input autoComplete='off' type={viewPassword ? 'text' : 'password'} name="password" placeholder='Password' className="input-field" value={password} onChange={e => setPassword(e.target.value)}/>
              <div className={`view-password ${password && 'active'}`} onClick={() => setViewPassword(!viewPassword)}>
              {viewPassword ?
              <FaRegEyeSlash/>
              :
              <FaRegEye/>}
            </div>
            </div>

            <div className="forgot-password">
              <h2>Forgot Password?</h2>
            </div>

            <button type='submit' onSubmit={e => handleSubmit(e)}>Login</button>
          </form>
        </article>
        <article className="new-here">
          <div className="header">
            <h1>New Here?</h1>
          </div>
          <p>Sign up and discover a great amount of new opportunities!</p>
          <button onClick={() => navigate('/signup')}>Sign Up</button>
        </article>
      </div>
    </section>
  )
}

export default Login