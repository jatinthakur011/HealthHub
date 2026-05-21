import React, { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditNoteIcon from '@mui/icons-material/EditNote';

export default function BookAppointment({ onSubmit }) {
    const [isOpen, setIsOpen] = useState(false);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [note, setNote] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !time) return;
        onSubmit?.({ date, time, note });
        setIsOpen(false);
        setDate("");
        setTime("");
        setNote("");
    };

    return (
        <div>
            <button
                className="px-6 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-110 transition duration-300"
                onClick={() => setIsOpen(true)}
            >
                💅 Book Appointment
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl border border-white/40 p-8 relative animate-in fade-in scale-in duration-300">
                        
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <CloseIcon className="text-gray-600" />
                        </button>

                        <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                            Book Appointment
                        </h3>
                        <p className="text-gray-600 mb-6">Choose your preferred date & time</p>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <EventIcon className="text-blue-600" />
                                        Select Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:shadow-lg outline-none transition-all duration-200"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <AccessTimeIcon className="text-purple-600" />
                                        Select Time
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:shadow-lg outline-none transition-all duration-200"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <EditNoteIcon className="text-indigo-600" />
                                        Describe Your Concern (Optional)
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:shadow-lg outline-none transition-all duration-200 resize-none"
                                        rows="3"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Tell us about your health concern..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-6 mt-8 border-t border-gray-200">
                                    <button
                                        type="button"
                                        className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition duration-300"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-105 transition duration-300"
                                    >
                                        Send Request
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}



