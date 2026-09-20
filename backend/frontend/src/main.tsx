import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { VideoQueueProvider } from './contexts/VideoQueueContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VideoQueueProvider>
      <App />
    </VideoQueueProvider>
  </StrictMode>,
)
