'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Transition } from '@headlessui/react'; // Assuming @headlessui/react is installed
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed top-4 right-4 z-[1000] space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};

const Toast = ({ id, message, type, duration, onRemove }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      // Give time for exit transition before removing from DOM
      setTimeout(() => onRemove(id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, id, onRemove]);

  const bgColorClass = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[type] || 'bg-gray-700';

  const IconComponent = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationCircleIcon,
  }[type] || InformationCircleIcon; // Default icon

  return (
    <Transition
      show={show}
      enter="transition-all ease-out duration-300"
      enterFrom="opacity-0 translate-x-full"
      enterTo="opacity-100 translate-x-0"
      leave="transition-all ease-in duration-300"
      leaveFrom="opacity-100 translate-x-0"
      leaveTo="opacity-0 translate-x-full"
    >
      <div
        className={`flex items-center justify-between p-4 rounded-lg shadow-lg text-white max-w-sm ${bgColorClass}`}
        role="alert"
      >
        <div className="flex items-center">
          <IconComponent className="h-6 w-6 mr-2" />
          <span className="font-semibold">{message}</span>
        </div>
        <button
          onClick={() => setShow(false)}
          className="ml-4 -mr-1 flex items-center justify-center h-7 w-7 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          aria-label="Close"
        >
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
    </Transition>
  );
};
