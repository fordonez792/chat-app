import React, { useState } from 'react'
import { FaLock, FaCheckDouble, FaTimes } from 'react-icons/fa'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

const ChangePassword = ({ closeModal }) => {
  const [error, setError]=useState('')

  const initialValues={
    oldPassword: '',
    newPassword: '',
    confirm: '',
  }

  const validationSchema=Yup.object().shape({
    oldPassword: Yup
    .string()
    .required('Field Required'),

    newPassword: Yup
    .string()
    .min(8, 'Password must be 8 characters long')
    .matches(/[0-9]/, 'Password requires a number')
    .matches(/[a-z]/, 'Password requires a lowercase letter')
    .matches(/[A-Z]/, 'Password requires an uppercase letter')
    .matches(/[^\w]/, 'Password requires a symbol'),

    confirm: Yup
    .string()
    .oneOf([Yup.ref('newPassword'), null], 'New Passwords must match')
  })

  const changePassword = data => {
    axios
      .put(`${process.env.REACT_APP_URL}users/change-password`, data, 
      { headers: { accessToken: localStorage.getItem('accessToken') } })
      .then(res => {
        if(res.data.error) setError(res.data.error)
        else logout()
      })
  }

  return (
    <div className="container">
        <article className="overlay" onClick={e => closeModal(e)}></article>
        <article className="modal">
          <div className="close-btn" onClick={e => closeModal(e)}><FaTimes/></div>
          <div className='header'>
            <h1>Change Your Password</h1>
            <h2>Enter your previous password and new password</h2>
          </div>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={changePassword}>
            <Form className='form-container'>
              <div className="error-container">
                {error!=='' && <span>{error}</span>}
                <ErrorMessage name="newPassword" component="span"/>
                <ErrorMessage name="confirm" component='span'/>
              </div>

              <div className="field-container">
                <label><FaLock/></label>
                <Field autoComplete='off' type='password' name='oldPassword' placeholder='Old Password' className="input-field"/>
              </div>

              <div className="field-container">
                <label><FaLock/></label>
                <Field autoComplete='off' type="password" name="newPassword" placeholder='New Password' className="input-field"/>
              </div>

              <div className="field-container">
                <label><FaCheckDouble/></label>
                <Field autoComplete='off' type="password" name="confirm" placeholder='Confirm Password' className="input-field"/>
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

export default ChangePassword