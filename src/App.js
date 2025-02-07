import React, { useState, useEffect } from "react";
import { Timer, Coffee, AlarmClock } from "lucide-react";

const Button = ({ onClick, disabled, children, variant, className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-4 rounded text-lg font-semibold w-full ${
      variant === "secondary"
        ? "bg-gray-300 hover:bg-gray-400"
        : "bg-blue-500 text-white hover:bg-blue-600"
    } ${className}`}
  >
    {children}
  </button>
);

const TimeTracker = () => {
  const getStoredTime = (key, defaultValue) => {
    const storedTime = localStorage.getItem(key);
    return storedTime ? parseInt(storedTime, 10) : defaultValue;
  };

  const [breakTime, setBreakTime] = useState(() =>
    getStoredTime("breakTime", 25 * 60)
  );
  const [lunchTime, setLunchTime] = useState(() =>
    getStoredTime("lunchTime", 60 * 60)
  );
  const [alarmTime, setAlarmTime] = useState(0);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [isLunchActive, setIsLunchActive] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [breakTimer, setBreakTimer] = useState(null);
  const [lunchTimer, setLunchTimer] = useState(null);
  const [alarmTimer, setAlarmTimer] = useState(null);

  useEffect(() => {
    localStorage.setItem("breakTime", breakTime);
    localStorage.setItem("lunchTime", lunchTime);
  }, [breakTime, lunchTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = (setTime, setActive, timerSetter, key, otherStopFn) => {
    otherStopFn(); // Detiene el otro temporizador si está activo
    setActive(true);
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setActive(false);
          return 0;
        }
        const newTime = prev - 1;
        localStorage.setItem(key, newTime);
        return newTime;
      });
    }, 1000);
    timerSetter(timer);
  };

  const stopTimer = (timer, setActive) => {
    if (timer) {
      clearInterval(timer);
      setActive(false);
    }
  };

  const resetTimes = () => {
    stopTimer(breakTimer, setIsBreakActive);
    stopTimer(lunchTimer, setIsLunchActive);
    setBreakTime(25 * 60);
    setLunchTime(60 * 60);
    localStorage.setItem("breakTime", 25 * 60);
    localStorage.setItem("lunchTime", 60 * 60);
  };

  // 🔔 Alarmas
  const startAlarm = (minutes) => {
    stopTimer(alarmTimer, setIsAlarmActive);
    setAlarmTime(minutes * 60);
    setIsAlarmActive(true);
    const timer = setInterval(() => {
      setAlarmTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsAlarmActive(false);
          playAlarmSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setAlarmTimer(timer);
  };

  const playAlarmSound = () => {
    const audio = new Audio("https://www.soundjay.com/button/beep-07.wav");
    audio.play();
  };

  useEffect(() => {
    return () => {
      clearInterval(breakTimer);
      clearInterval(lunchTimer);
      clearInterval(alarmTimer);
    };
  }, [breakTimer, lunchTimer, alarmTimer]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-center text-2xl font-bold mb-6">
        Control de Tiempos
      </h2>

      {/* Baño */}
      <div className="bg-gray-100 p-5 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-medium flex items-center gap-2">
            <Timer className="w-6 h-6" />
            Tiempo de Baño
          </h3>
          <span className="text-2xl font-bold">{formatTime(breakTime)}</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              startTimer(
                setBreakTime,
                setIsBreakActive,
                setBreakTimer,
                "breakTime",
                () => stopTimer(lunchTimer, setIsLunchActive)
              )
            }
            disabled={isBreakActive || breakTime <= 0}
          >
            Iniciar
          </Button>
          <Button
            onClick={() => stopTimer(breakTimer, setIsBreakActive)}
            disabled={!isBreakActive}
            variant="secondary"
          >
            Pausar
          </Button>
        </div>
      </div>

      {/* Almuerzo */}
      <div className="bg-gray-100 p-5 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-medium flex items-center gap-2">
            <Coffee className="w-6 h-6" />
            Tiempo de Almuerzo
          </h3>
          <span className="text-2xl font-bold">{formatTime(lunchTime)}</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              startTimer(
                setLunchTime,
                setIsLunchActive,
                setLunchTimer,
                "lunchTime",
                () => stopTimer(breakTimer, setIsBreakActive)
              )
            }
            disabled={isLunchActive || lunchTime <= 0}
          >
            Iniciar
          </Button>
          <Button
            onClick={() => stopTimer(lunchTimer, setIsLunchActive)}
            disabled={!isLunchActive}
            variant="secondary"
          >
            Pausar
          </Button>
        </div>
      </div>

      {/* Botón Reset */}
      <Button onClick={resetTimes} variant="outline" className="w-full mb-6">
        Reiniciar Tiempos
      </Button>

      {/* Alarmas */}
      <div className="bg-gray-100 p-5 rounded-lg">
        <h3 className="text-xl font-medium flex items-center gap-2 mb-3">
          <AlarmClock className="w-6 h-6" />
          Alarmas
        </h3>
        <div className="flex justify-between">
          <Button onClick={() => startAlarm(5)} className="px-3 py-2">
            5 min
          </Button>
          <Button onClick={() => startAlarm(10)} className="px-3 py-2">
            10 min
          </Button>
          <Button onClick={() => startAlarm(15)} className="px-3 py-2">
            15 min
          </Button>
        </div>
        {isAlarmActive && (
          <p className="text-center mt-3 text-lg font-bold text-red-600">
            Alarma en: {formatTime(alarmTime)}
          </p>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <TimeTracker />
    </div>
  );
}
