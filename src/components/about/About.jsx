import React from "react";
import { doctors } from "../../assets";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Link } from "react-router-dom";
import { useInView } from "../../hooks/useInView";

export default function About() {
  const [featuresRef, featuresInView] = useInView();
  const [howItWorksRef, howItWorksInView] = useInView();
  const [servicesRef, servicesInView] = useInView();
  return (
    <div className="bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 min-h-screen">
      <div className='relative flex flex-col lg:flex-row items-center justify-between w-full px-6 lg:px-16 py-20 rounded-3xl shadow-xl overflow-hidden bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 m-6'>
        
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-cyan-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>

        <div className='max-w-xl z-10'>
          <h2 className='inline-block bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-1 rounded-full text-sm mb-4 shadow'>
            ABOUT HEALTHHUB
          </h2>

          <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-teal-600 to-blue-600 text-transparent bg-clip-text animate-pulse'>
            Simplifying <br /> Healthcare <br /> For Everyone
          </h1>

          <p className='text-lg text-gray-700 mt-6 leading-relaxed'>
            HealthHub connects patients with trusted professionals, making healthcare simple, fast, and reliable. Access quality care anytime, anywhere.
          </p>

          <div className='flex items-center gap-4 mt-8 flex-wrap'>
            <Link to='/doctors'
              className='px-8 py-3 rounded-full text-white bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg hover:scale-110 hover:shadow-2xl transition duration-300 font-semibold'>
              Find Doctors
            </Link>

            <Link to='/location'
              className='px-8 py-3 rounded-full text-white bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg hover:scale-110 hover:shadow-2xl transition duration-300 font-semibold'>
              Find Hospitals
            </Link>
          </div>
        </div>

        <div className='mt-10 lg:mt-0'>
          <img
            src={doctors}
            alt="healthcare team"
            className="w-full max-w-md rounded-3xl shadow-2xl border-4 border-white hover:scale-[1.05] hover:-rotate-2 transition duration-500"
          />
        </div>
      </div>

      <section ref={featuresRef} className='w-full px-6 lg:px-16 mt-24 relative'>
        
        <h1 className={`text-4xl font-bold text-center mb-4 bg-gradient-to-r from-teal-600 to-blue-600 text-transparent bg-clip-text transition-all duration-700 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Why Choose HealthHub?
        </h1>
        
        <p className={`text-center text-gray-600 mb-16 max-w-2xl mx-auto transition-all duration-700 delay-100 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          We leverage cutting-edge technology and a network of trusted healthcare professionals to bring quality care right to your fingertips.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative'>
          {[
            {
              icon: '🏥',
              title: 'Find Hospitals',
              desc: 'Discover nearby hospitals and emergency services with real-time location tracking.',
              color: 'from-teal-100 to-emerald-100'
            },
            {
              icon: '👨‍⚕️',
              title: 'Expert Doctors',
              desc: 'Connect with verified medical professionals and book appointments instantly.',
              color: 'from-blue-100 to-cyan-100'
            },
            {
              icon: '🩸',
              title: 'Blood Donation',
              desc: 'Save lives by donating blood. Find donors and recipients in your area.',
              color: 'from-red-100 to-pink-100'
            },
            {
              icon: '📞',
              title: 'Video Consultations',
              desc: 'Connect with doctors via video calls from the comfort of your home.',
              color: 'from-purple-100 to-pink-100'
            },
            {
              icon: '⭐',
              title: 'Reviews & Ratings',
              desc: 'Read authentic reviews from real patients to make informed decisions.',
              color: 'from-amber-100 to-orange-100'
            },
            {
              icon: '🔒',
              title: 'Secure & Private',
              desc: 'Your health data is encrypted and protected with industry-leading security.',
              color: 'from-cyan-100 to-blue-100'
            },
          ].map((feature, index) => (
            <div key={index} className={`relative group transition-all duration-1000 ease-out ${featuresInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`} style={{transitionDelay: featuresInView ? `${index * 250}ms` : '0ms'}}>
              <div className='absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-blue-400 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300'></div>
              
              <div className={`relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 h-full flex flex-col items-center text-center bg-gradient-to-br ${feature.color}`}>
                <div className='text-5xl mb-4 group-hover:scale-110 transition duration-300'>
                  {feature.icon}
                </div>
                <h3 className='text-xl font-bold text-gray-800 mb-3'>{feature.title}</h3>
                <p className='text-gray-600 text-sm leading-relaxed flex-grow'>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section ref={howItWorksRef} className='w-full px-6 lg:px-16 mt-24 relative'>
        
        <h1 className={`text-4xl font-bold text-center mb-16 bg-gradient-to-r from-teal-600 to-blue-600 text-transparent bg-clip-text transition-all duration-700 ${howItWorksInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          How HealthHub Works
        </h1>

        <div className='relative'>
          <div
            className={`hidden lg:block absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-teal-300 to-blue-300 transition-all duration-700 ${
              howItWorksInView ? 'opacity-100 delay-[900ms]' : 'opacity-0'
            }`}
          ></div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative'>
            {[
              { step: 1, icon: '📝', title: 'Create Account', desc: 'Sign up easily with your email or phone number' },
              { step: 2, icon: '🔍', title: 'Search Doctors', desc: 'Browse verified doctors and read patient reviews' },
              { step: 3, icon: '📅', title: 'Book Appointment', desc: 'Schedule at your preferred time with just a few clicks' },
              { step: 4, icon: '✨', title: 'Get Care', desc: 'Meet your doctor in-person or via video consultation' },
            ].map((item, index) => (
              <div key={index} className={`relative group transition-all duration-1000 ease-out ${howItWorksInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`} style={{transitionDelay: howItWorksInView ? `${index * 250}ms` : '0ms'}}>
                <div className='absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-blue-400 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300'></div>
                
                <div className='relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 h-full flex flex-col items-center text-center'>
                  
                  <div className='mb-4 relative'>
                    <div className='w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition duration-300'>
                      {item.icon}
                    </div>
                    <div className='absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg'>
                      {item.step}
                    </div>
                  </div>

                  <h3 className='text-xl font-bold text-gray-800 mb-2'>{item.title}</h3>
                  <p className='text-gray-600 text-sm leading-relaxed flex-grow'>{item.desc}</p>

                  <div className='mt-4 flex items-center gap-2 text-teal-600 font-semibold'>
                    <CheckCircleIcon className='text-lg' />
                    <span>Easy</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      <section ref={servicesRef} className='w-full px-6 lg:px-16 mt-24 pb-20'>

        <h2 className={`text-4xl font-bold text-center mb-16 bg-gradient-to-r from-teal-600 to-blue-600 text-transparent bg-clip-text transition-all duration-700 ${servicesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Our Services
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {[
            {
              title: "Find Hospitals",
              desc: "Locate nearest hospitals with real-time information and emergency services.",
              icon: '🏥',
              link: "/location",
              bgGradient: "from-green-50 to-emerald-50",
              borderColor: "border-green-200",
              textColor: "text-green-700",
              accentGradient: "from-green-400 to-emerald-500",
            },
            {
              title: "Book Appointments",
              desc: "Schedule consultations with experienced doctors at your convenience.",
              icon: '📅',
              link: "/doctors",
              bgGradient: "from-blue-50 to-cyan-50",
              borderColor: "border-blue-200",
              textColor: "text-blue-700",
              accentGradient: "from-blue-400 to-cyan-500",
            },
            {
              title: "Blood Donation",
              desc: "Donate blood and save lives. Find donors and help those in need.",
              icon: '🩸',
              link: "/blood",
              bgGradient: "from-red-50 to-pink-50",
              borderColor: "border-red-200",
              textColor: "text-red-700",
              accentGradient: "from-red-400 to-pink-500",
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${card.bgGradient} shadow-lg hover:shadow-2xl transition-all duration-1000 ease-out border-2 ${card.borderColor} hover:-translate-y-3 cursor-pointer ${servicesInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}
              style={{transitionDelay: servicesInView ? `${i * 250}ms` : '0ms'}}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r ${card.accentGradient} transition duration-300`}></div>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
                <div className="absolute -left-20 top-0 w-40 h-full bg-white/40 blur-xl rotate-12 translate-x-[-100%] group-hover:translate-x-[250%] transition-all duration-700"></div>
              </div>

              <div className="relative z-10">
                <div className={`text-5xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition duration-300`}>{card.icon}</div>

                <h3 className={`text-2xl font-bold mb-3 ${card.textColor}`}>
                  {card.title}
                </h3>

                <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                  {card.desc}
                </p>

                <Link to={card.link}>
                  <button className={`relative inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r ${card.accentGradient} text-white font-semibold shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300`}>
                    <span>Explore</span>
                    <ArrowOutwardIcon fontSize="small" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>



      <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white text-center py-8">
        <p className='text-sm text-gray-400'>Making healthcare accessible to everyone. © 2026 HealthHub</p>
      </footer>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
}
