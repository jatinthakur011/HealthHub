import React from 'react'
import { useForm } from 'react-hook-form';
import bloodServices from '../../appwrite/blood';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

const COUNTRY_CODES = [
    { label: 'India', code: '+91', flag: '🇮🇳' },
    { label: 'United States', code: '+1', flag: '🇺🇸' },
    { label: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { label: 'Canada', code: '+1', flag: '🇨🇦' },
    { label: 'Australia', code: '+61', flag: '🇦🇺' },
    { label: 'UAE', code: '+971', flag: '🇦🇪' },
    { label: 'Singapore', code: '+65', flag: '🇸🇬' },
    { label: 'Germany', code: '+49', flag: '🇩🇪' },
]

function Form({ onClose }) {

    const { register, handleSubmit, formState: { errors } } = useForm({
      defaultValues: {
        phoneCode: '+91',
      }
    })
    const user = useSelector((state) => state.auth.userData)
    const navigate = useNavigate()

    const submit = async(data) => {
        const payload = {
          ...data,
          phno: `${data.phoneCode} ${data.phoneNumber}`,
          user_id: user.$id
        }
        const message = await bloodServices.createMessage(payload)
        if(message){
            console.log("message created");
            navigate("/blood-req")
        }
    };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl border border-white/40 p-8 relative animate-in fade-in scale-in duration-300">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <CloseIcon className="text-gray-600" />
        </button>

        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-600 to-pink-600 text-transparent bg-clip-text">
          Request Blood
        </h2>
        <p className="text-gray-600 mb-6">Fill in your details to request blood</p>

        <form onSubmit={handleSubmit(submit)}>
          <div className='space-y-5'>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input 
                placeholder="Enter your full name"
                type="text"
                {...register("name", {
                    required: "Name is required",
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/70 focus:ring-2 focus:ring-red-400 focus:border-transparent focus:shadow-lg outline-none transition-all duration-200"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
              <select
                {...register("group", {
                    required: "Blood group is required",
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/70 focus:ring-2 focus:ring-red-400 focus:border-transparent focus:shadow-lg outline-none transition-all duration-200"
              >
                <option value="">Select blood group</option>
                <option value="O+">O+ (O Positive)</option>
                <option value="O-">O- (O Negative)</option>
                <option value="A+">A+ (A Positive)</option>
                <option value="A-">A- (A Negative)</option>
                <option value="B+">B+ (B Positive)</option>
                <option value="B-">B- (B Negative)</option>
                <option value="AB+">AB+ (AB Positive)</option>
                <option value="AB-">AB- (AB Negative)</option>
              </select>
              {errors.group && <p className="text-red-500 text-xs mt-1">{errors.group.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Units Required</label>
              <input
                placeholder="How many units do you need?"
                type="number"
                min="1"
                {...register("requiredUnits", {
                    required: "Units required",
                    min: { value: 1, message: "Minimum 1 unit" },
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/70 focus:ring-2 focus:ring-red-400 focus:border-transparent focus:shadow-lg outline-none transition-all duration-200"
              />
              {errors.requiredUnits && <p className="text-red-500 text-xs mt-1">{errors.requiredUnits.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                placeholder="Enter your location / hospital"
                type="text"
                {...register("location", {
                    required: "Location is required",
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/70 focus:ring-2 focus:ring-red-400 focus:border-transparent focus:shadow-lg outline-none transition-all duration-200"
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
                <select
                  {...register("phoneCode", {
                      required: "Country code is required",
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/70 focus:ring-2 focus:ring-red-400 focus:border-transparent focus:shadow-lg outline-none transition-all duration-200"
                >
                  {COUNTRY_CODES.map((item, index) => (
                    <option
                      key={`${item.code}-${item.label}-${index}`}
                      value={item.code}
                    >
                      {item.flag} {item.label} ({item.code})
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Enter your phone number"
                  type="tel"
                  inputMode="numeric"
                  {...register("phoneNumber", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{6,14}$/,
                        message: "Enter a valid phone number"
                      }
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/70 focus:ring-2 focus:ring-red-400 focus:border-transparent focus:shadow-lg outline-none transition-all duration-200"
                />
              </div>
              {(errors.phoneCode || errors.phoneNumber) && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phoneCode?.message || errors.phoneNumber?.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className='w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-lg hover:scale-105 transition duration-300 mt-6'
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Form

