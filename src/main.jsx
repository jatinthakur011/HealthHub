import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import store from './store/store.js'
import { Provider } from 'react-redux'
import { ToastContainer, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Home, About, AllReq, ReqPage, Blood, Contact, Login, Signup, AuthLayout, Location, Doctors } from './components/index.js'
import {
  AddDoc,
  AllDoc,
  EditDoc,
  Doctor,
  Room,
  Video,
  DoctorLogin,
  DoctorDashboard,
  DoctorHome,
  AdminComplaints,
  AdminDashboard,
} from "./pages/index.js"
import VideoCall from './pages/VideoCall.jsx'
import DoctorEmail from "./pages/DoctorEmail.jsx"
import AdminApplications from './pages/AdminApplications.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children : [
      {
        path: "/",
        element: <Home />
      },
      {
        path: '/doctor-login',
        element: <DoctorLogin />
      },
      {
        path: '/doctor-dashboard',
        element: (
          <AuthLayout authentication doctorOnly>
            <DoctorDashboard />
          </AuthLayout>
        )
      },
      {
        path: '/doctor-home',
        element: (
          <AuthLayout authentication doctorOnly>
            <DoctorHome />
          </AuthLayout>
        )
      },
      {
        path: '/doctor-email/:doctorId',
        element: (
          <AuthLayout authentication doctorOnly>
            <DoctorEmail />
          </AuthLayout>
        )
      },
      {
        path: '/admin/applications',
        element: (
          <AuthLayout authentication adminOnly>
            <AdminApplications />
          </AuthLayout>
        )
      },
      {
        path: '/admin/complaints',
        element: (
          <AuthLayout authentication adminOnly>
            <AdminComplaints />
          </AuthLayout>
        )
      },
      {
        path: '/admin',
        element: (
          <AuthLayout authentication adminOnly>
            <AdminDashboard />
          </AuthLayout>
        )
      },
      {
        path: '/admin/doctors',
        element: (
          <AuthLayout authentication adminOnly>
            <AdminDashboard />
          </AuthLayout>
        )
      },
      {
        path: "/about",
        element: (
          <AuthLayout authentication>
            <About />
          </AuthLayout>
        )
      },
      {
        path: "/contact",
        element: (
          <AuthLayout authentication>
            <Contact />
          </AuthLayout>
        )
      },
      {
        path: '/login',
        element: (
            <AuthLayout authentication={false}>
                <Login />
            </AuthLayout>
        )
      },
      {
        path: '/signup',
        element: (
            <AuthLayout authentication={false}>
                <Signup />
            </AuthLayout>
        )
      },
      {
        path: '/room',
        element: (
          <AuthLayout authentication>
            <Room />
          </AuthLayout>
        )
      },

      {
        path: '/video/:roomid',
        element: (
          <AuthLayout authentication>
            <Video />
          </AuthLayout>
        )
      },
      {
        path: '/video-call/:token',
        element: (
          <AuthLayout authentication>
            <VideoCall />
          </AuthLayout>
        )
      },
      {
        path: "doctors",
        element: (
          <AuthLayout authentication>
            <Doctors />
          </AuthLayout>
        )
      },
      {
        path: "all-doctors",
        element: (
          <AuthLayout authentication>
            <AllDoc />
          </AuthLayout>
        )
      },
      {
        path: '/doc-cr',
        element: <AddDoc />
      },
      {
        path: '/doc-ud/:slug',
        element: (
          <AuthLayout authentication doctorOnly>
            <EditDoc />
          </AuthLayout>
        )
      },
      {
        path: '/doctor/:slug',
        element: (
          <AuthLayout authentication>
            <Doctor />
          </AuthLayout>
        )
      },
      {
        path: "blood",
        element: (
          <AuthLayout authentication>
            <Blood />
          </AuthLayout>
        )
      },
      {
        path: '/blood-req',
        element: (
          <AuthLayout authentication>
            <AllReq />
          </AuthLayout>
        )
      },
      {
        path: '/blood-req/:slug',
        element: (
          <AuthLayout authentication>
            <ReqPage />
          </AuthLayout>
        )
      },
      {
        path: '/location',
        element: (
          <AuthLayout authentication>
            <Location />
          </AuthLayout>
        )
      },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
    <RouterProvider router={router}/>
    </Provider>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
    />
  </React.StrictMode>,
)

