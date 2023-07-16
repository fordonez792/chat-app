import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { FaUserAlt, FaLock, FaCheckDouble } from 'react-icons/fa'
import * as Yup from 'yup'
import axios from 'axios'

const Signup = () => {
  const navigate=useNavigate()

  const initialValues={
    username: '',
    password: '',
    confirm: '',
  }

  const validationSchema=Yup.object().shape({
    username: Yup
    .string()
    .min(3, 'Username must be minimum 3 characters')
    .max(25, 'Username must be maximum 25 characters')
    .required('Field Required'),

    password: Yup
    .string()
    .min(8, 'Password must be 8 characters long')
    .matches(/[0-9]/, 'Password requires a number')
    .matches(/[a-z]/, 'Password requires a lowercase letter')
    .matches(/[A-Z]/, 'Password requires an uppercase letter')
    .matches(/[^\w]/, 'Password requires a symbol'),

    confirm: Yup
    .string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
  })

  const handleSubmit = data => {
    axios
      .post(`${process.env.REACT_APP_URL}users`, data)
      .then(() => {
        navigate('/login')
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <section id="signup" className='page'> 
      <div className="container">
        <article className="create-account">
          <div className="header">
            <h1>Create Account</h1>
          </div>
          <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema} >
            <Form className='form-container'>
              <div className="error-container">
                <ErrorMessage name="username" component="span"/>
                <ErrorMessage name="password" component="span"/>
                <ErrorMessage name="confirm" component='span'/>
              </div>

              <div className="field-container">
                <label><FaUserAlt/></label>
                <Field autoComplete='off' name='username' placeholder='Username' className="input-field"/>
              </div>

              <div className="field-container">
                <label><FaLock/></label>
                <Field autoComplete='off' type="password" name="password" placeholder='Password' className="input-field"/>
              </div>

              <div className="field-container">
                <label><FaCheckDouble/></label>
                <Field autoComplete='off' type="password" name="confirm" placeholder='Confirm Password' className="input-field"/>
              </div>
              <button type='submit'>Sign Up</button>
            </Form>
          </Formik>
        </article>
        <article className="welcome-back">
          <div className="header">
            <h1>Welcome Back</h1>
          </div>
          <p>To keep connected with us please login with your personal information</p>
          <button onClick={() => navigate('/login')}>Login</button>
        </article>
      </div>
    </section>
  )
}

export default Signup