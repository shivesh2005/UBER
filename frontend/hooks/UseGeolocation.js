import { useEffect, useState } from 'react'

// Watches this device's position while `enabled` is true.
export default function useGeolocation(enabled = true) {
  const [position, setPosition] = useState(null) // { lat, lng, heading }
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return undefined
    if (!('geolocation' in navigator)) {
      setError('This browser does not support location.')
      return undefined
    }

    const watchId = navigator.geolocation.watchPosition(
      (p) => {
        setError(null)
        setPosition({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          heading: p.coords.heading,
        })
      },
      (err) =>
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Location is blocked. Allow location access in your browser settings.'
            : 'Could not get your location.'
        ),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [enabled])

  return { position, error }
}