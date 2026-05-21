import React, { useRef, useState, useEffect } from "react";
import { doctorsImage, map } from "../../assets/index.js";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import docService from "../../appwrite/authDoc.js";
import reviewServices from "../../services/reviews.js";
import DocPost from "./DocPost.jsx";

export default function Home() {
  const auth = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [doctorRatings, setDoctorRatings] = useState({});
  const [ratingLoading, setRatingLoading] = useState(false);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const scrollDoctors = (direction) => {
    if (!sliderRef.current) return;
    const scrollAmount = Math.min(sliderRef.current.clientWidth * 0.9, 380);
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (auth && posts.length === 0) {
      docService.getPosts([]).then((posts) => {
        if (posts && posts.documents) {
          setPosts(posts.documents);
        }
      });
    }
  }, [auth, posts.length]);

  useEffect(() => {
    if (!posts.length) {
      setDoctorRatings({});
      return;
    }

    let isCancelled = false;

    const loadRatings = async () => {
      setRatingLoading(true);
      const ratingMap = {};

      await Promise.all(
        posts.map(async (post) => {
          try {
            const summary = await reviewServices.getDoctorReviewSummary(post._id);
            if (isCancelled) return;
            ratingMap[post._id] = {
              averageRating: Number(summary?.averageRating || 0),
              reviewCount: Number(summary?.reviewCount || 0),
            };
          } catch (e) {
            console.error("Failed to fetch review summary for", post._id, e);
            ratingMap[post._id] = {
              averageRating: 0,
              reviewCount: 0,
            };
          }
        }),
      );

      if (!isCancelled) {
        setDoctorRatings(ratingMap);
        setRatingLoading(false);
      }
    };

    loadRatings();
    const intervalId = setInterval(loadRatings, 30000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [posts]);

  return (
    <>

    <div className='relative m-6 flex w-auto flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 px-6 py-16 shadow-xl lg:flex-row lg:px-16 lg:py-20'>

        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500 opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-500 opacity-30 rounded-full blur-3xl animate-pulse"></div>

        <div className='max-w-xl z-10'>
            <h2 className='inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm mb-4 shadow'>
                WE TAKE CARE OF YOUR HEALTH
            </h2>

            <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-transparent bg-clip-text animate-pulse'>
                Consult your doctor <br /> from home
            </h1>

            <p className='text-lg text-gray-700 mt-6 leading-relaxed'>
                Choose the best online therapy services and connect instantly.
            </p>

            <div className='flex items-center gap-4 mt-8'>
                <Link to='/doctors'
                    className='px-6 py-3 rounded-full text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:scale-110 hover:shadow-2xl transition duration-300'>
                    Book a meeting
                </Link>

                <Link to='/about/#soln'
                    className='text-blue-700 font-semibold hover:underline'>
                    How it works
                </Link>
            </div>
        </div>

        <div className='mt-10 lg:mt-0 relative z-10 group perspective'>
            <img
                className='h-[300px] sm:h-[400px] lg:h-[500px] object-cover rounded-3xl shadow-2xl transform transition duration-500 group-hover:rotate-3 group-hover:scale-110 animate-[float_5s_ease-in-out_infinite]'
                src={doctorsImage}
                alt="Doctor"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition"></div>
        </div>
    </div>

    <div className='relative mt-24 w-full overflow-x-hidden px-6 lg:px-16'>

        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text'>
                    Meet Our Specialist Doctors
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                    Slide through our doctors and quickly explore more profiles without taking too much page space.
                </p>
            </div>

            <div className="hidden md:flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => scrollDoctors("left")}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-100/80 bg-white/80 text-slate-700 shadow-[0_12px_26px_rgba(148,163,184,0.14)] transition hover:-translate-y-0.5 hover:text-violet-600 hover:shadow-[0_18px_32px_rgba(99,102,241,0.16)]"
                >
                    <ArrowBackIosNewRoundedIcon fontSize="small" />
                </button>
                <button
                    type="button"
                    onClick={() => scrollDoctors("right")}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-100/80 bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 text-white shadow-[0_14px_28px_rgba(99,102,241,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(99,102,241,0.28)]"
                >
                    <ArrowForwardIosRoundedIcon fontSize="small" />
                </button>
            </div>
        </div>

        <div className='relative'>

            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-10 bg-gradient-to-r from-white/80 via-white/35 to-transparent lg:block" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-10 bg-gradient-to-l from-white/80 via-white/35 to-transparent lg:block" />

            <div
                ref={sliderRef}
                className={`flex gap-6 overflow-x-auto pb-4 pt-2 pr-2 transition [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory ${
                !auth.status ? "blur-md opacity-50" : ""
            }`}
                style={{ scrollbarWidth: "none" }}
            >
                {posts.length ? posts.map((post) => (
                    <div className="min-w-[290px] max-w-[290px] snap-start rounded-[30px] border border-white/70 bg-gradient-to-br from-white/90 via-violet-50/70 to-sky-50/75 backdrop-blur-xl shadow-[0_18px_40px_rgba(148,163,184,0.18)] hover:-translate-y-3 hover:shadow-[0_24px_55px_rgba(99,102,241,0.18)] transition duration-300 md:min-w-[320px] md:max-w-[320px]" key={post._id}>
                        <DocPost
                          {...post}
                          averageRating={doctorRatings[post._id]?.averageRating || 0}
                          reviewCount={doctorRatings[post._id]?.reviewCount || 0}
                          ratingLoading={ratingLoading}
                        />
                    </div>
                )) : (
                    <div className='w-full text-center text-lg'>Loading...</div>
                )}
            </div>

            {posts.length > 3 && (
                <div className="mt-5 flex items-center justify-center gap-3 md:hidden">
                    <button
                        type="button"
                        onClick={() => scrollDoctors("left")}
                        className="rounded-full border border-violet-100/80 bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                    >
                        Previous
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollDoctors("right")}
                        className="rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-sm"
                    >
                        Next
                    </button>
                </div>
            )}

            {!auth.status && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">

                    <div className="bg-white/90 backdrop-blur-xl px-10 py-8 rounded-3xl shadow-2xl text-center border border-white/40">

                        <LockIcon className='text-6xl text-purple-600 mb-3 animate-bounce'/>

                        <p className='text-lg font-semibold text-gray-800 mb-4'>
                            Login to unlock doctors
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate("/login")}
                                className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-110 transition shadow-lg"
                            >
                                Login
                            </button>

                            <button
                                onClick={() => navigate("/signup")}
                                className="px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-110 transition shadow-lg"
                            >
                                Sign Up
                            </button>
                        </div>

                    </div>

                </div>
            )}

        </div>

    </div>

    <div className='relative mt-24 overflow-x-hidden px-6 py-16 lg:px-16 lg:py-20'>

        <div className="absolute inset-0">
            <img
                className='w-full h-full object-cover rounded-3xl opacity-20'
                src={map}
                alt=""
            />
        </div>

        <div className='relative flex flex-col lg:flex-row items-center justify-between backdrop-blur-lg bg-white/40 rounded-3xl p-10 shadow-xl'>

            <div className='max-w-lg'>
                <h1 className='text-4xl font-bold leading-tight mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text'>
                    Find hospitals near you instantly
                </h1>

                <Link to='/location'
                    className='inline-flex items-center gap-2 px-6 py-3 rounded-full text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow hover:scale-110 transition'>
                    Find <LocationOnIcon/>
                </Link>
            </div>

            <div className='mt-8 lg:mt-0'>
                <img
                    className='h-[300px] sm:h-[400px] object-cover rounded-3xl shadow-xl hover:scale-110 transition'
                    src={map}
                    alt=""
                />
            </div>
        </div>
    </div>

    </>
  )
}

