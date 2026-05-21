import React, { useState, useEffect } from "react";
import { DocSignup } from "../components";
import docService from "../appwrite/authDoc";
import doctorsApi from "../services/doctors";
import { useNavigate, useParams } from "react-router-dom";

function EditDoc() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) {
        navigate("/");
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        let doc = await docService.getPost(slug);
        if (!doc) {
          try {
            doc = await doctorsApi.getDoctor(slug);
          } catch {
            doc = null;
          }
        }
        if (!doc) {
          const me = await doctorsApi.getCurrentDoctor();
          if (me && String(me._id || me.id) === String(slug)) {
            doc = me;
          }
        }
        if (!cancelled && doc) {
          setPost(doc);
        } else if (!cancelled) {
          setLoadError("Could not load your profile. Check that you are logged in as this doctor.");
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setLoadError(e?.message || "Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-50 to-indigo-50/40 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />
        <p className="text-sm font-medium text-slate-600">Loading profile editor…</p>
      </div>
    );
  }

  if (loadError || !post) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-md text-sm text-rose-600">{loadError || "Profile not found."}</p>
        <button
          type="button"
          onClick={() => navigate("/doctor-home")}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700"
        >
          Back to doctor home
        </button>
      </div>
    );
  }

  return (
    <div className="edit-doc-root">
      <DocSignup post={post} />
    </div>
  );
}

export default EditDoc;

