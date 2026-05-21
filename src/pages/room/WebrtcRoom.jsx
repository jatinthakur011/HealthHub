import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'


const WebrtcRoom = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roomid = searchParams.get('doctor_id') || searchParams.get('roomid')

  useEffect(() => {
    if (roomid) navigate(`/video/${roomid}`)
    else navigate('/video')
  }, [roomid, navigate])

  return null
}

export default WebrtcRoom

