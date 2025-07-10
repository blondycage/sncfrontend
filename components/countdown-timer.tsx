"use client"

import { useEffect, useState } from "react"

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 89,
    hours: 23,
    minutes: 59,
    seconds: 59,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex gap-3">
      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-md bg-blue-600 text-white">
        <span className="text-2xl font-bold">{timeLeft.days}</span>
        <span className="text-xs uppercase">Days</span>
      </div>
      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-md bg-blue-600 text-white">
        <span className="text-2xl font-bold">{timeLeft.hours}</span>
        <span className="text-xs uppercase">Hours</span>
      </div>
      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-md bg-blue-600 text-white">
        <span className="text-2xl font-bold">{timeLeft.minutes}</span>
        <span className="text-xs uppercase">Minutes</span>
      </div>
      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-md bg-blue-600 text-white">
        <span className="text-2xl font-bold">{timeLeft.seconds}</span>
        <span className="text-xs uppercase">Seconds</span>
      </div>
    </div>
  )
}
