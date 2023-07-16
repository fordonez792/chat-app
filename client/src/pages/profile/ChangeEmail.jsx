import React, { useState } from 'react'
import { FaLock, FaAt, FaTimes, FaRegEye, FaRegEyeSlash } from 'react-icons/fa'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import axios from 'axios'
import * as Yup from 'yup'

const ChangeEmail = ({ closeModal, setUserInfo }) => {
  const [error, setError]=useState('')
  const [viewPassword, setViewPassword]=useState(false)

  const initialValues={
    email: '',
    password: '',
  }

  const validationSchema=Yup.object().shape({
    email: Yup
    .string()
    .email('Invalid Email')
    .matches(/@[^.]*\./, 'Invalid Email Format')
    .required('Required'),

    password: Yup
    .string()
    .required('Required')
  })

  const addEmail = (data, { resetForm }) => {
    axios
      .put(`${process.env.REACT_APP_URL}user-verification`, data, 
      { headers: { accessToken: localStorage.getItem('accessToken') } })
      .then(res => {
        if(res.data.error) setError(res.data.error)
        setUserInfo(res.data.user)
        closeModal()
        resetForm()
      })
      .catch(error => {
        console.log(error)
      })
  }

  return (
    <div className="container">
        <article className="overlay" onClick={e => closeModal(e)}></article>
        <article className="modal">
          <div className="close-btn" onClick={e => closeModal(e)}><FaTimes/></div>
          <div className='header'>
            <h1>Add Your Email</h1>
            <h2>Enter a working email address and your password, a confirmation email will be sent immediately</h2>
          </div>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={addEmail}>
            <Form className='form-container'>
              <div className="error-container">
                {error!=='' && <span>{error}</span>}
                <ErrorMessage name="email" component="span"/>
                <ErrorMessage name="password" component='span'/>
              </div>

              <div className="field-container">
                <label><FaAt/></label>
                <Field autoComplete='off' type='email' name='email' placeholder='Email' className="input-field"/>
              </div>

              <div className="field-container">
                <label><FaLock/></label>
                <Field autoComplete='off' type={viewPassword ? 'text' : 'password'} name="password" placeholder='Password' className="input-field"/>
                <div className='view-password active' onClick={() => setViewPassword(!viewPassword)}>
                  {viewPassword ? <FaRegEyeSlash/> : <FaRegEye/>}
                </div>
              </div>

              <div className="btn-container">
                <button className='cancel' onClick={e => closeModal(e)}>Cancel</button>
                <button type='submit'>Done</button>
              </div>
            </Form>
          </Formik>
        </article>
      </div>
  )
}

export default ChangeEmail