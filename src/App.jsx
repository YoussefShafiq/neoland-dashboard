import { useState } from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './Components/Auth/Login'
import ProtectedRoute from './Components/Auth/ProtectedRoute'
import Layout from './Components/Layout/Layout'
import { Toaster } from 'react-hot-toast'
import SidebarContextProvider from './Contexts/SidebarContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Notfound from './Components/Notfound'
import Home from './Components/Pages/Home'
import Admins from './Components/Pages/Admins'
import Blogs from './Components/Pages/Blogs'
import ErrorPage from './Components/errorHandling/ErrorPage'
import Categories from './Components/Pages/Categories'
import Locations from './Components/Pages/Locations'
import Developers from './Components/Pages/Developers'
import Finishings from './Components/Pages/Finishing'
import Projects from './Components/Pages/Projects'
import Units from './Components/Pages/Units'

function App() {

  const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    {
      path: '/', element: <ProtectedRoute><Layout /></ProtectedRoute>, children: [
        { index: true, element: <ProtectedRoute><Home /></ProtectedRoute> },
        { path: '/admins', element: <ProtectedRoute><Admins /></ProtectedRoute> },
        { path: '/categories', element: <ProtectedRoute><Categories /></ProtectedRoute> },
        { path: '/locations', element: <ProtectedRoute><Locations /></ProtectedRoute> },
        { path: '/developers', element: <ProtectedRoute><Developers /></ProtectedRoute> },
        { path: '/finishings', element: <ProtectedRoute><Finishings /></ProtectedRoute> },
        { path: '/projects', element: <ProtectedRoute><Projects /></ProtectedRoute> },
        { path: '/units', element: <ProtectedRoute><Units /></ProtectedRoute> },
        { path: '/blogs', element: <ProtectedRoute><Blogs /></ProtectedRoute> },

      ]
    },
    { path: '*', element: <Notfound /> }
  ])

  let query = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return (
    <>
      <SidebarContextProvider>
        <QueryClientProvider client={query}>
          <RouterProvider router={router} />
          <Toaster
            position='bottom-right'
            reverseOrder={false}
          />
        </QueryClientProvider>
      </SidebarContextProvider>
    </>
  )
}

export default App
