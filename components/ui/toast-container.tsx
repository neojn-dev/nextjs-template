"use client"

import { ToastContainer, toast } from 'react-toastify'
// Temporarily commented out to debug CSS build issue
// import 'react-toastify/dist/ReactToastify.css'

// Export toast functions for use in other components
export { toast }

// Custom toast configuration
export const toastConfig = {
  position: "top-right" as const,
  autoClose: 4000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light" as const,
}

export function ToastContainerWrapper() {
  return (
    <ToastContainer
      {...toastConfig}
      closeButton={true}
      newestOnTop={true}
      limit={3}
      hideProgressBar={true}
    />
  )
}
