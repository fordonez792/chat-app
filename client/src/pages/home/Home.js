import React from 'react'
import { HomeProvider } from '../../context/homeContext'
import { useMyContext } from '../../context/context'

import LandingPage from './LandingPage'
import LoggedInHome from './LoggedInHome'

const Home = () => {
  const { authState, setAuthState }=useMyContext()

  return (
    <section id="home" className="page">
      <HomeProvider>
        <div className="container">
          {authState.status ? <LoggedInHome/> : <LandingPage/>}
        </div>
      </HomeProvider>
    </section>
  )
}

export default Home