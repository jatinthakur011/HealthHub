import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import authServices from './appwrite/auth'
import docService from './services/doctors'
import './App.css'
import { login, logout, switchRole } from './store/authSlice'
import { Header, Footer } from './components'
import IncomingCallListener from './components/IncomingCallListener.jsx'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResult, doctorResult] = await Promise.allSettled([
          authServices.getCurrentUser(),
          docService.getCurrentDoctor(),
        ]);

        const userData = userResult.status === 'fulfilled' ? userResult.value : null;
        const doctorData = doctorResult.status === 'fulfilled' ? doctorResult.value : null;

        if (userData) {
          dispatch(login({ userData, role: 'user' }));
        }
        if (doctorData) {
          const docUserData = {
            id: doctorData._id || doctorData.id,
            name: doctorData.name,
            email: doctorData.email,
            role: 'doctor',
            doctorData: doctorData
          };
          dispatch(login({ userData: docUserData, role: 'doctor' }));
          dispatch(switchRole('doctor'));
        }
        if (!userData && !doctorData) {
          dispatch(logout({}));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (loading) return

    const doctorLoggedIn =
      auth.currentRole === 'doctor' ||
      auth.userData?.role === 'doctor' ||
      !!auth.doctorSession ||
      !!localStorage.getItem('doctor_token')

    if (doctorLoggedIn && location.pathname === '/') {
      navigate('/doctor-home', { replace: true })
    }
  }, [auth, loading, location.pathname, navigate])
  

  const hideFooter =
    location.pathname.startsWith('/video') ||
    location.pathname.startsWith('/video-call')

  return !loading ? (
    <div className="flex min-h-screen min-h-[100dvh] w-full max-w-[100vw] flex-col overflow-x-hidden scroll-smooth bg-transparent">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
      <IncomingCallListener />
      {!hideFooter && <Footer />}
    </div>
   )
   : (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      <h1 className='text-base font-medium text-slate-600'>Loading HealthHub...</h1>
    </div>
   );
}

export default App

