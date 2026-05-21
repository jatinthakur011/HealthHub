import React from 'react'
import { Link } from 'react-router-dom'
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export default function Footer() {
  return (
    <footer className="relative mt-20">

      <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 opacity-30 blur-3xl"></div>
      <div className="relative bg-[#0f172a]/90 backdrop-blur-xl border-t border-white/10">
<div className="mx-auto w-full max-w-screen-xl px-6 py-10">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
 <div>
   <Link to="/" className="flex items-center">
                <h1 className='text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text hover:scale-105 transition'>
                  Health<span className='text-white'>Hub</span>
                </h1>
              </Link>

                        <Link to="/doc-cr">
                        <h1 className='font-sans bg-gradient-to-r
                        from-cyan-100 to-cyan-700 text-transparent
                        bg-clip-text uppercase border-cyan-900 border-b-2 rounded-xl px-2 py-1 w-2/3 sm:w-full mt-2'  >
                            Apply for Doctor
                        </h1>
                        </Link>

              <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                Your trusted platform for online doctor consultations, health programs and medical support.
              </p>
            </div>

            <div>
              <h2 className='text-lg font-semibold text-white mb-4 border-b border-white/20 pb-1'>
                About
              </h2>
              <ul className='space-y-2 text-gray-400 text-sm'>
                {["Health Queries","Online Doctor App","Contact us","Terms and Conditions","Privacy Policy"].map((item)=>(
                  <li key={item} className="hover:text-white hover:translate-x-1 transition cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className='text-lg font-semibold text-white mb-4 border-b border-white/20 pb-1'>
                Services
              </h2>
              <ul className='space-y-2 text-gray-400 text-sm'>
                {["Online Doctor Consultation","Health Program","All Doctors List","Find Hospitals","Blood donation"].map((item)=>(
                  <li key={item} className="hover:text-white hover:translate-x-1 transition cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className='text-lg font-semibold text-white mb-4 border-b border-white/20 pb-1'>
                Connect
              </h2>

              <div className="flex gap-4 mt-4">

                {[FacebookIcon, InstagramIcon, XIcon, GitHubIcon, LinkedInIcon].map((Icon, index)=>(
                  <Link key={index}
                    to="#"
                    className="p-2 rounded-full bg-white/10 backdrop-blur-md text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:scale-110 transition-all shadow">
                    <Icon />
                  </Link>
                ))}

              </div>

              <p className="text-gray-400 text-sm mt-4">
                Follow us for updates & health tips.
              </p>
            </div>

          </div>

          <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center">

            <span className="text-sm text-gray-400">
              © 2026 HealthHub. All Rights Reserved.
            </span>

            <div className="flex gap-6 mt-4 sm:mt-0 text-sm text-gray-400">
              <span className="hover:text-white cursor-pointer transition">Privacy</span>
              <span className="hover:text-white cursor-pointer transition">Terms</span>
              <span className="hover:text-white cursor-pointer transition">Support</span>
            </div>

          </div>

        </div>
      </div>

    </footer>
  )
}
