import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

// Opens one authenticated socket for as long as the component is mounted.
export default function useSocket(token) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return undefined

    const s = io(BASE_URL, { auth: { token } })
    s.on('connect', () => { setConnected(true); setError(null) })
    s.on('disconnect', () => setConnected(false))
    s.on('connect_error', (err) => setError(err.message))
    setSocket(s)

    return () => {
      s.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [token])

  return { socket, connected, error }
}