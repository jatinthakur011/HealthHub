import React from 'react'
import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView'

export default function Doctors() {
  const [benefitsRef, benefitsInView] = useInView()
  const [specialtiesRef, specialtiesInView] = useInView()
  const [howItWorksRef, howItWorksInView] = useInView()
  return (
    <div className='bg-[#eef1f4] min-h-screen'>
      <div className='relative flex flex-col lg:flex-row items-center justify-between w-full px-6 lg:px-16 py-20 rounded-3xl shadow-xl overflow-hidden bg-gradient-to-r from-slate-100 via-blue-100 to-purple-100 m-6'>

        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>

        <div className='max-w-xl z-10'>
          <h2 className='inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm mb-4 shadow'>
            EXPERT HEALTHCARE
          </h2>

          <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text animate-pulse'>
            Find Your <br /> Perfect Doctor
          </h1>

          <p className='text-lg text-gray-700 mt-6 leading-relaxed'>
            Connect with highly qualified doctors and specialists. Book appointments, get expert advice, and take control of your health journey.
          </p>

          <div className='flex items-center gap-4 mt-8 flex-wrap'>
            <Link to='/all-doctors'
              className='px-8 py-3 rounded-full text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:scale-110 hover:shadow-2xl transition duration-300 font-semibold'>
              Browse Doctors
            </Link>

            <a href='#how-it-works'
              className='px-8 py-3 rounded-full border-2 border-blue-600 text-blue-600 shadow-lg hover:bg-blue-50 hover:scale-110 transition duration-300 font-semibold'>
              How It Works
            </a>
          </div>
        </div>

        <div className='mt-10 lg:mt-0 relative z-10 flex items-center justify-center'>
          <div className='group relative h-[320px] w-[280px] sm:h-[420px] sm:w-[340px] lg:h-[500px] lg:w-[400px]'>
            <div className='absolute inset-0 rounded-[42px] bg-gradient-to-br from-blue-300/20 via-violet-300/12 to-cyan-300/18 blur-3xl opacity-80 transition duration-500 group-hover:opacity-100'></div>
            <div className='absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/30 opacity-45 animate-[heartbeatHalo_3.4s_ease-in-out_infinite]'></div>
            <div className='absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/25 opacity-0 animate-[heartbeatHalo_3.4s_ease-in-out_infinite_1.4s]'></div>

            <div className='relative h-full w-full animate-[float_5.5s_ease-in-out_infinite] transition duration-500 group-hover:scale-[1.03] group-hover:-translate-y-2'>
              <div className='absolute left-1/2 top-10 h-[248px] w-[200px] -translate-x-1/2 rounded-[38px] border-[10px] border-white/70 bg-gradient-to-b from-white/80 via-white/40 to-white/20 shadow-[0_28px_60px_rgba(15,23,42,0.2)] backdrop-blur-md sm:h-[320px] sm:w-[236px] lg:h-[380px] lg:w-[270px]'>
                <div className='absolute inset-[12px] rounded-[28px] bg-gradient-to-b from-slate-50/95 via-blue-50/70 to-violet-50/65 overflow-hidden'>
                  <div className='absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500'></div>

                  <div className='absolute left-1/2 top-10 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-[0_12px_28px_rgba(59,130,246,0.16)]'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 shadow-inner'>
                      <div className='relative h-6 w-6'>
                        <div className='absolute left-1/2 top-0 h-full w-2.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500 to-violet-600'></div>
                        <div className='absolute left-0 top-1/2 h-2.5 w-full -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500 to-violet-600'></div>
                      </div>
                    </div>
                    <div>
                      <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400'>Doctor Finder</p>
                      <p className='mt-1 text-sm font-bold text-slate-700'>Verified Specialists</p>
                    </div>
                  </div>

                  <div className='absolute left-1/2 top-[118px] h-[84px] w-[84px] -translate-x-1/2 rounded-full border-[6px] border-white/85 bg-gradient-to-br from-blue-100 via-white to-violet-100 shadow-[0_14px_30px_rgba(99,102,241,0.16)] sm:top-[134px] lg:top-[152px]'>
                    <div className='absolute left-1/2 top-[18px] h-7 w-7 -translate-x-1/2 rounded-full bg-gradient-to-br from-slate-500 to-slate-700'></div>
                    <div className='absolute left-1/2 top-[44px] h-8 w-12 -translate-x-1/2 rounded-t-[18px] rounded-b-[12px] bg-gradient-to-br from-blue-500 to-violet-600'></div>
                  </div>

                  <div className='absolute left-1/2 top-[214px] flex w-[80%] -translate-x-1/2 items-center justify-between rounded-2xl bg-white/86 px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.08)] sm:top-[248px] lg:top-[288px]'>
                    <div>
                      <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400'>Specialty</p>
                      <p className='mt-1 text-sm font-bold text-slate-700'>General Checkup</p>
                    </div>
                    <div className='h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 shadow-inner'></div>
                  </div>

                  <div className='absolute left-1/2 top-[272px] h-[48px] w-[80%] -translate-x-1/2 rounded-2xl border border-white/50 bg-white/55 px-3 py-2 sm:top-[314px] lg:top-[356px]'>
                    <div className='doctor-heartbeat-line'></div>
                  </div>
                </div>
              </div>

              <div className='absolute left-3 top-[132px] flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-blue-50 to-violet-100 p-4 shadow-[0_18px_32px_rgba(99,102,241,0.16)] transition duration-500 group-hover:-translate-x-1 group-hover:-translate-y-2 sm:top-[164px] lg:top-[190px]'>
                <div className='relative h-12 w-12'>
                  <div className='absolute inset-x-[18px] top-0 h-full rounded-full bg-slate-400'></div>
                  <div className='absolute left-0 top-[18px] h-[12px] w-full rounded-full bg-slate-400'></div>
                  <div className='absolute left-[9px] top-[6px] h-[30px] w-[30px] rounded-full border-[5px] border-blue-400 border-b-transparent bg-transparent rotate-45'></div>
                </div>
              </div>

              <div className='absolute right-1 top-[122px] rounded-[30px] border border-white/70 bg-gradient-to-br from-white via-cyan-50 to-blue-100 px-4 py-4 shadow-[0_18px_32px_rgba(59,130,246,0.16)] transition duration-500 group-hover:translate-x-1 group-hover:-translate-y-2 sm:top-[152px] lg:top-[178px]'>
                <div className='mb-3 flex items-center gap-2'>
                  <div className='h-3 w-3 rounded-full bg-emerald-400'></div>
                  <p className='text-[11px] font-semibold text-slate-500'>Live Status</p>
                </div>
                <div className='mb-2 h-2 w-20 rounded-full bg-blue-200'></div>
                <div className='mb-2 h-2 w-16 rounded-full bg-violet-200'></div>
                <div className='h-2 w-12 rounded-full bg-cyan-200'></div>
              </div>

              <div className='absolute right-[26px] top-[286px] h-20 w-20 rounded-[26px] border border-white/70 bg-gradient-to-br from-white via-emerald-50 to-cyan-100 shadow-[0_18px_28px_rgba(16,185,129,0.14)] transition duration-500 group-hover:translate-y-1 sm:top-[348px] lg:top-[402px]'>
                <div className='absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80'></div>
                <div className='absolute left-1/2 top-1/2 h-10 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500'></div>
                <div className='absolute left-1/2 top-1/2 h-3 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500'></div>
              </div>

              <div className='absolute bottom-8 left-1/2 h-10 w-56 -translate-x-1/2 rounded-full bg-indigo-950/12 blur-2xl transition duration-500 group-hover:w-64'></div>
            </div>
          </div>
        </div>
      </div>

      <section ref={benefitsRef} className='w-full px-6 lg:px-16 mt-20 mb-8 relative bg-[#d7dee8] rounded-3xl py-16 mx-auto'>
        <h2 className={`text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text transition-all duration-700 ${benefitsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Why Choose Our Doctors?
        </h2>
        
        <p className={`text-center text-gray-600 mb-16 max-w-2xl mx-auto text-lg transition-all duration-700 delay-100 ${benefitsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          We partner with the best healthcare professionals to deliver exceptional care
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[
            { icon: '🎓', title: 'Certified & Qualified', desc: 'Board-certified professionals with extensive credentials' },
            { icon: '🏥', title: 'Multi-Specialty', desc: 'Specialists across all major medical fields' },
            { icon: '⏰', title: 'Available 24/7', desc: 'Book appointments at your preferred time' },
            { icon: '💬', title: 'Easy Communication', desc: 'Direct messaging with your doctor anytime' },
          ].map((item, i) => (
            <div 
              key={i}
              className={`group relative overflow-hidden rounded-2xl p-6 bg-[#e4e9f1] shadow-lg hover:shadow-2xl border border-[#c5cfdd] hover:-translate-y-2 transition-all duration-1000 ease-out ${benefitsInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}
              style={{transitionDelay: benefitsInView ? `${i * 250}ms` : '0ms'}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition duration-300"></div>
              
              <div className='relative z-10'>
                <div className='text-5xl mb-3 group-hover:scale-110 transition duration-300'>{item.icon}</div>
                <h3 className='text-lg font-bold text-gray-800 mb-2'>{item.title}</h3>
                <p className='text-gray-600 text-sm'>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section ref={specialtiesRef} className='w-full px-6 lg:px-16 py-16 relative bg-[#d7dee8] rounded-3xl mx-auto mt-8'>
        <h2 className={`text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text transition-all duration-700 ${specialtiesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Our Medical Specialties
        </h2>
        
        <p className={`text-center text-gray-600 mb-16 max-w-2xl mx-auto text-lg transition-all duration-700 delay-100 ${specialtiesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Access a wide range of medical experts in various specializations
        </p>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
          {[
            '🔬 Cardiology',
            '🧠 Neurology',
            '👶 Pediatrics',
            '🦷 Dentistry',
            '👁️ Ophthalmology',
            '🏃 Sports Medicine',
            '🤰 Gynecology',
            '💪 Orthopedics',
            '🫁 Pulmonology',
            '🩺 General Health',
            '👨‍⚕️ Dermatology',
            '🧘 Psychiatry',
          ].map((specialty, i) => (
            <div 
              key={i}
              className={`group relative bg-[#e4e9f1] rounded-xl p-6 text-center shadow-md hover:shadow-xl border border-[#c5cfdd] hover:border-[#b9c4d6] hover:-translate-y-2 cursor-pointer transition-all duration-1000 ease-out ${specialtiesInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}
              style={{transitionDelay: specialtiesInView ? `${i * 150}ms` : '0ms'}}
            >
              <p className='text-2xl mb-2'>{specialty.split(' ')[0]}</p>
              <p className='text-sm font-semibold text-gray-700'>{specialty.split(' ')[1]}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={howItWorksRef} id="how-it-works" className='w-full px-6 lg:px-16 py-20 relative bg-[#d7dee8]'>
        <h2 className={`text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text transition-all duration-700 ${howItWorksInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          How It Works
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 relative'>
          {[
            { num: '1', title: 'Browse Doctors', desc: 'Explore profiles of qualified healthcare professionals' },
            { num: '2', title: 'Check Reviews', desc: 'Read ratings and feedback from other patients' },
            { num: '3', title: 'Book Appointment', desc: 'Select date, time and confirm your booking' },
            { num: '4', title: 'Consult', desc: 'Meet with your doctor online or in-person' },
          ].map((step, i) => (
            <div key={i} className={`group relative transition-all duration-1000 ease-out ${howItWorksInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`} style={{transitionDelay: howItWorksInView ? `${i * 250}ms` : '0ms'}}>
              <div className='relative bg-[#e4e9f1] rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#c5cfdd] h-full hover:-translate-y-2'>
                
                <div className='absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg'>
                  {step.num}
                </div>

                <h3 className='text-xl font-bold text-gray-800 mb-3 mt-4'>{step.title}</h3>
                <p className='text-gray-600 text-sm leading-relaxed'>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='w-full px-6 lg:px-16 my-20 relative bg-[#d7dee8]'>
        <div className='relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-16 text-white text-center shadow-2xl overflow-hidden'>
          
          <div className="absolute inset-0">
            <div className='absolute top-0 left-0 w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-3xl'></div>
            <div className='absolute bottom-0 right-0 w-80 h-80 bg-purple-400 opacity-20 rounded-full blur-3xl'></div>
          </div>

          <div className='relative z-10'>
            <h2 className='text-4xl font-bold mb-6'>Ready to Meet Your Doctor?</h2>
            <p className='text-xl opacity-95 mb-10 max-w-2xl mx-auto leading-relaxed'>
              Browse through our network of professional doctors, read patient reviews, and book your appointment in minutes.
            </p>
            <Link to='/all-doctors'
              className='inline-block px-10 py-4 bg-white text-purple-600 font-bold rounded-full hover:scale-110 hover:shadow-2xl transition duration-300 shadow-lg'>
              Browse Doctors
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}


