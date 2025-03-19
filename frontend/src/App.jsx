import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './RootLayout'
import './App.css'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Form_mp3 from './components/Form_mp3'
import PdfViewer from './components/PdfViewer'
function App() {
  const browser=createBrowserRouter([
    {
      path: '/',
      element: <RootLayout/>,
      children: [
        {
          path: '/',
          element: <Home />
        },
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/signup',
          element: <Register />
        },
        {
          path: '/form',
          element: <Form_mp3 />
        },
        {
          path: '/pdf-viewer',
          element: <PdfViewer />
        }
      ]
    }
  ])
  return (
    <RouterProvider router={browser} />
  )
}

export default App