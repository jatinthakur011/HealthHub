import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../conf/api'

const VideoCall = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [callInfo, setCallInfo] = useState(null)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const res = await fetch(`${api.apiBaseUrl}/video-call-links/validate/${token}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Invalid or expired link')
        }
        const data = await res.json()
        if (!mounted) return
        setCallInfo(data)
        navigate(`/video/${token}`)
      } catch (err) {
        if (!mounted) return
        setError(err.message)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }
    init()
    return () => {
      mounted = false
    }
  }, [token, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Validating call link...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gray-900 text-center text-white px-4">
        <p className="text-red-400 text-lg">{error}</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 px-5 py-2 rounded-lg">
          Go back
        </button>
      </div>
    )
  }

  return null
}

export default VideoCall

