import React,{useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'

export default function Protected({
    children,
    authentication = true,
    doctorOnly = false,
    adminOnly = false
}) {
    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const auth = useSelector(state => state.auth)
    const authStatus = auth.status
    

    useEffect(() => {
      if (authStatus === undefined) {
        return;
      }
      
      if(authentication && authStatus !== authentication){
        navigate("/login")
        setLoader(false)
        return
      }
      
      // Check for admin role
      if (adminOnly) {
        const isAdmin = auth.userData?.role === 'admin' || localStorage.getItem('role') === 'admin';
        if (!isAdmin) {
          navigate("/");
          setLoader(false)
          return
        }
      }
      
      if(doctorOnly) {
        const hasDoctorSession =
          auth.currentRole === 'doctor' ||
          !!auth.doctorSession ||
          !!localStorage.getItem('doctor_token')

        if (!hasDoctorSession) {
          navigate("/doctor-login")
          setLoader(false)
          return
        }
      }
      if(!authentication && authStatus !== authentication){
        navigate("/")
        setLoader(false)
        return
      }
      setLoader(false)
    }, [auth, authStatus, navigate, authentication, doctorOnly, adminOnly])
    

  return loader ? <h1>Loading...</h1> : <>{children}</>
}


