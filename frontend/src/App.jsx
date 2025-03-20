import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './RootLayout';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Form_mp3 from './components/Form_mp3';
import PdfViewer from './components/PdfViewer';
import DocumentUpload from './components/DocumentUpload'; // New component
import Dashboard from './components/Dashboard'; // New component
import Result from './components/Result';

function App() {
  const browser = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: '/analyze',
          element: <Result />
        },
        {
          path: '/login',
          element: <Login />,
        },
        {
          path: '/signup',
          element: <Register />,
        },
        {
          path: '/form',
          element: <Form_mp3 />,
        },
        {
          path: '/pdf-viewer',
          element: <PdfViewer />,
        },
        {
          path: '/document-upload', // New route for document upload
          element: <DocumentUpload />, // We'll pass setResult via Header
        },
        {
          path: '/dashboard', // New route for dashboard
          element: <Dashboard />, // We'll pass result via Header
        },
      ],
    },
  ]);

  return <RouterProvider router={browser} />;
}

export default App;