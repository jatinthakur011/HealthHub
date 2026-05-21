import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import docService from "../../appwrite/authDoc";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import maleDoctorImage from "../../assets/doc1.jpg";
import femaleDoctorImage from "../../assets/femdoc.jpg";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

export default function DocSignup({ post }) {
    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            name: post?.name || "",
            email: post?.email || "",
            password: "",
            title: post?.title || "",
            gender: post?.gender || "male",
            description: post?.description || "",
            availability: post?.availability || "Mon - Fri, 9:00 AM - 5:00 PM",
            zone: post?.zone || "Online",
            phone: post?.phone || "",
            experience: post?.experience || "5 years",
            degrees: post?.degrees || "MBBS, MD",
            consultationFee: post?.consultationFee || "500",
            status: post?.status || "active",
        },
    });

    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState(null)
    const [localPreviewImage, setLocalPreviewImage] = useState(null)

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const watchedValues = watch();
    const imageFile = watchedValues.image?.[0];

    const defaultDoctorImage = useMemo(() => {
        return String(watchedValues.gender || post?.gender || "").toLowerCase() === "female"
            ? femaleDoctorImage
            : maleDoctorImage;
    }, [watchedValues.gender, post?.gender]);

    useEffect(() => {
        if (!imageFile) {
            setLocalPreviewImage(null)
            return undefined
        }

        const objectUrl = URL.createObjectURL(imageFile)
        setLocalPreviewImage(objectUrl)

        return () => {
            URL.revokeObjectURL(objectUrl)
        }
    }, [imageFile])

    useEffect(() => {
        const specialty = watchedValues.title?.toLowerCase();
        if (specialty && !watchedValues.description && !post?.description) {
            const autoDescriptions = {
                cardiologist: "Experienced cardiologist specializing in heart health, providing comprehensive cardiac care including diagnosis, treatment, and prevention of cardiovascular diseases.",
                dermatologist: "Expert dermatologist offering advanced skin care treatments, acne management, cosmetic procedures, and personalized skincare solutions.",
                neurologist: "Specialized neurologist treating neurological disorders, brain and nerve conditions with advanced diagnostic and therapeutic approaches.",
                pediatrician: "Dedicated pediatrician providing comprehensive healthcare for infants, children, and adolescents with compassionate and expert medical care.",
                orthopedist: "Orthopedic specialist focusing on musculoskeletal system, offering treatment for bones, joints, ligaments, tendons, and muscles.",
                gynecologist: "Gynecologist providing comprehensive women's health care, including reproductive health, pregnancy care, and preventive screenings.",
                psychiatrist: "Mental health specialist offering diagnosis and treatment for various psychiatric conditions with evidence-based therapeutic approaches.",
                dentist: "Professional dentist providing comprehensive oral health care, preventive dentistry, and advanced dental treatments.",
                ophthalmologist: "Eye care specialist offering comprehensive vision services, eye examinations, and treatment for various eye conditions.",
                endocrinologist: "Endocrinology specialist managing hormonal disorders, diabetes, thyroid conditions, and metabolic health."
            };
            const autoDesc = autoDescriptions[specialty] || "Experienced medical professional providing high-quality healthcare services with a patient-centered approach.";
            setValue("description", autoDesc);
        }
    }, [watchedValues.title, watchedValues.description, post?.description, setValue]);

    const previewImage = useMemo(() => {
        if (localPreviewImage) return localPreviewImage
        if (post?.doctorImage) {
            if (typeof post.doctorImage === "string" && (post.doctorImage.startsWith("http") || post.doctorImage.startsWith("/"))) {
                return post.doctorImage;
            }
            return docService.getFilePreview(post.doctorImage);
        }
        return defaultDoctorImage;
    }, [defaultDoctorImage, localPreviewImage, post?.doctorImage]);

    const identitySummary = watchedValues.name || post?.name || "Doctor name";
    const titleSummary = watchedValues.title || post?.title || "Speciality title";
    const availabilitySummary = watchedValues.availability || "Working hours";
    const zoneSummary = watchedValues.zone || "Clinic zone";
    const phoneSummary = watchedValues.phone || post?.phone || "Phone not set";
    const experienceSummary = watchedValues.experience || post?.experience || "Experience not set";
    const degreesSummary = watchedValues.degrees || post?.degrees || "Degrees not set";
    const feeSummary = watchedValues.consultationFee || post?.consultationFee || "N/A";
    const descriptionSummary = watchedValues.description || post?.description || "Introduce your practice, care style, and what patients can expect from consultations.";

    const submit = async (data) => {
        setLoading(true)
        const id = post?._id || post?.$id || post?.id
        try {
            console.debug('DocSignup submitting', { id, data })
            setServerError(null)
        if (post) {
            const file = data.image && data.image[0] ? await docService.uploadFile(data.image[0]) : null;

            if (file) {
                try { docService.deleteFile(post.doctorImage); } catch(e){}
            }

            const updateData = { ...data };
            try {
                if (!localStorage.getItem('doctor_token')) {
                    delete updateData.status;
                }
            } catch(e) {}
            if (file) updateData.doctorImage = file.fileId || file.$id;
            else delete updateData.doctorImage; // don't overwrite existing image when no new file

            console.debug('DocSignup update submit', { id: post.$id, updateData });
            const dbPost = await docService.updatePost(id, updateData);
            console.debug('DocSignup update response', dbPost)
            if (dbPost) {
                try { localStorage.setItem('doctor_info', JSON.stringify(dbPost)); } catch(e) {}
                navigate(`/doctor/${dbPost.$id || dbPost._id || dbPost.id}`);
                toast.success('Updated successfully')
            } else {
                toast.error('Failed to update profile');
            }
        } else {
            const file = data.image && data.image[0] ? await docService.uploadFile(data.image[0]) : null;

            if (file) {
                const fileId = file.fileId || file.$id;
                data.doctorImage = fileId;
            }

            console.debug('DocSignup create submit', { data });
            const dbPost = await docService.createPost({ ...data, user_id: userData.$id || userData?._id || userData?.id });
            console.debug('DocSignup create response', dbPost)

            if (dbPost) {
                navigate(`/doctor/${dbPost.$id || dbPost._id || dbPost.id}`);
            } else {
                toast.error('Failed to create profile');
            }
        }
        } catch (e) {
            console.error('DocSignup submit error', e);
            const msg = e?.message || (e?.status ? `Error ${e.status}` : 'An error occurred while saving your profile')
            setServerError(msg)
            toast.error(msg)
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.12),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(129,140,248,0.14),_transparent_22%),linear-gradient(180deg,#f4f8fc_0%,#fbfdff_40%,#eff4f8_100%)] px-2 py-6 sm:px-4 md:px-6 lg:px-8">
            <div className="w-full max-w-none">
                <div className="overflow-hidden rounded-[36px] border border-white/80 bg-[linear-gradient(135deg,#0f172a_0%,#132238_45%,#12304b_100%)] px-5 py-6 shadow-[0_28px_80px_rgba(15,23,42,0.20)] sm:px-7 md:px-9 lg:px-10 lg:py-9">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div className="min-w-0">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100 backdrop-blur">
                                <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
                                Doctor Workspace
                            </div>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                {post ? "Edit Doctor Profile" : "Apply for Doctor Registration"}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                                {post ? "Update your profile details and keep your information current." : "Fill out the form below to register as a doctor. Provide accurate information for verification."}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">Profile Status</p>
                                    <p className="mt-1 text-sm font-medium text-white">{watchedValues.status || post?.status || "active"}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">Consultation Fee</p>
                                    <p className="mt-1 text-sm font-medium text-white">Rs. {feeSummary}</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:self-end">
                            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">Identity</p>
                                <p className="mt-1 truncate text-sm font-medium text-white">{identitySummary}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">Specialty</p>
                                <p className="mt-1 truncate text-sm font-medium text-white">{titleSummary}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">Location</p>
                                <p className="mt-1 truncate text-sm font-medium text-white">{zoneSummary}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-[1.6fr_1fr] xl:gap-9">
                    <div className="space-y-6 h-full">
                        <section className="h-full rounded-[34px] border border-white/80 bg-white/88 p-6 shadow-[0_24px_54px_rgba(148,163,184,0.16)] backdrop-blur sm:p-7 lg:p-8">
                            <div className="rounded-[28px] border border-sky-100/70 bg-[linear-gradient(180deg,#f8fdff_0%,#f1f7fc_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                <div className="mb-6">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Doctor Registration Form</p>
                                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{post ? "Update Profile" : "Doctor Application"}</h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                        {post ? "Modify your professional details below." : "Complete all required fields to submit your application."}
                                    </p>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm">
                                            <div className="flex items-center gap-2 text-sky-700">
                                                <MedicalServicesOutlinedIcon sx={{ fontSize: 18 }} />
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Specialty</p>
                                            </div>
                                            <p className="mt-2 text-sm font-semibold text-slate-800">{titleSummary}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm">
                                            <div className="flex items-center gap-2 text-cyan-700">
                                                <EventAvailableOutlinedIcon sx={{ fontSize: 18 }} />
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Availability</p>
                                            </div>
                                            <p className="mt-2 text-sm font-semibold text-slate-800">{availabilitySummary}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm">
                                            <div className="flex items-center gap-2 text-indigo-700">
                                                <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Zone</p>
                                            </div>
                                            <p className="mt-2 text-sm font-semibold text-slate-800">{zoneSummary}</p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(submit)} className="space-y-6">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Doctor Name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter your full name"
                                                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                                {...register("name", { required: true })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                placeholder="doctor@example.com"
                                                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                                {...register("email", { required: !post })}
                                            />
                                        </div>
                                    </div>

                                    {!post && (
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                                            <input
                                                type="password"
                                                placeholder="Create a secure password"
                                                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                                {...register("password", { required: !post })}
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Specialty</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Cardiologist, Dermatologist"
                                                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                                {...register("title", { required: true })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                                            <select
                                                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                                {...register("gender", { required: true })}
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                        <textarea
                                            rows="4"
                                            placeholder="Describe your expertise, experience, and what patients can expect..."
                                            className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                            {...register("description", { required: true })}
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Availability</label>
                                            <input
                                                type="text"
                                                placeholder="Mon - Fri, 9:00 AM - 5:00 PM"
                                                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                                {...register("availability")}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Zone/Location</label>
                                            <input
                                                type="text"
                                                placeholder="Online, Delhi, Mumbai, etc."
                                                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                                {...register("zone")}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                placeholder="+91 9876543210"
                                                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                                {...register("phone")}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Experience</label>
                                            <input
                                                type="text"
                                                placeholder="5 years"
                                                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                                {...register("experience")}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Degrees</label>
                                            <input
                                                type="text"
                                                placeholder="MBBS, MD"
                                                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                                {...register("degrees")}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Consultation Fee</label>
                                            <input
                                                type="text"
                                                placeholder="500"
                                                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                                {...register("consultationFee")}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Upload License/Photo</label>
                                        <div className="rounded-[24px] border border-dashed border-sky-200 bg-white/80 px-4 py-4">
                                            <input
                                                type="file"
                                                accept="image/png, image/jpg, image/jpeg, image/gif"
                                                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-sky-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-800"
                                                {...register("image", { required: !post })}
                                            />
                                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                                <PaymentsOutlinedIcon sx={{ fontSize: 15 }} />
                                                Upload your medical license or professional photo.
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs leading-5 text-slate-500">
                                            Upload your medical license or professional photo.
                                        </p>
                                    </div>

                                    {serverError && (
                                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                            <div className="font-semibold">Error</div>
                                            <div className="mt-1 break-words">{serverError}</div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-[22px] px-5 py-4 text-sm font-semibold text-white shadow-lg transition bg-gradient-to-r from-slate-900 via-sky-900 to-slate-800 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.22)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Submitting..." : post ? "Update Profile" : "Submit Application"}
                                    </button>
                                </form>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6 h-full">
                        <section className="h-full rounded-[34px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_45px_rgba(148,163,184,0.14)] backdrop-blur sm:p-7">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Profile Preview</p>
                            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Live Preview</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                See how your profile will appear to patients.
                            </p>

                            <div className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#eaf5ff_0%,#eef2ff_48%,#f4f8fb_100%)] p-4">
                                <div className="rounded-[26px] bg-white p-3 shadow-[0_14px_34px_rgba(148,163,184,0.16)]">
                                    <img
                                        src={previewImage}
                                        alt={watchedValues.name || post?.name || "Doctor preview"}
                                        className="h-64 w-full rounded-[20px] object-cover sm:h-72"
                                    />
                                    <div className="mt-4 rounded-[22px] bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7fb_100%)] px-4 py-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Doctor Profile</p>
                                        <p className="mt-2 text-lg font-semibold text-slate-900">Dr. {identitySummary}</p>
                                        <p className="mt-1 text-sm font-medium text-sky-700">{titleSummary}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm">
                                                {experienceSummary}
                                            </span>
                                            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm">
                                                Rs. {feeSummary}
                                            </span>
                                        </div>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Availability</p>
                                                <p className="mt-1 text-sm font-medium text-slate-700">{availabilitySummary}</p>
                                            </div>
                                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Location</p>
                                                <p className="mt-1 text-sm font-medium text-slate-700">{zoneSummary}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Phone</p>
                                                <p className="mt-1 text-sm font-medium text-slate-700">{phoneSummary}</p>
                                            </div>
                                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Experience</p>
                                                <p className="mt-1 text-sm font-medium text-slate-700">{experienceSummary}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Degrees</p>
                                                <p className="mt-1 text-sm font-medium text-slate-700">{degreesSummary}</p>
                                            </div>
                                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Fee</p>
                                                <p className="mt-1 text-sm font-medium text-slate-700">₹{feeSummary}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Introduction</p>
                                            <p className="mt-1 line-clamp-4 text-sm leading-6 text-slate-600">{descriptionSummary}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

