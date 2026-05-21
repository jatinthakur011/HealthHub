import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../conf/api'

const specialtyOptions = [
  { value: 'Cardiology',    label: 'Cardiology' },
  { value: 'Neurology',     label: 'Neurology' },
  { value: 'Pediatrics',    label: 'Pediatrics' },
  { value: 'Dentistry',     label: 'Dentistry' },
  { value: 'Ophthalmology', label: 'Ophthalmology' },
  { value: 'Sports',        label: 'Sports Medicine' },
  { value: 'Gynecology',    label: 'Gynecology' },
  { value: 'Orthopedics',   label: 'Orthopedics' },
  { value: 'Pulmonology',   label: 'Pulmonology' },
  { value: 'General',       label: 'General Practice' },
  { value: 'Dermatology',   label: 'Dermatology' },
  { value: 'Psychiatry',    label: 'Psychiatry' },
  { value: 'Other',         label: 'Other' },
]

const specialtyDescriptions = {
  Cardiology:    'Expert in heart and cardiovascular care.',
  Neurology:     'Specialist in nervous system and brain health.',
  Pediatrics:    'Child health specialist from newborns to teens.',
  Dentistry:     'Oral and dental care professional.',
  Ophthalmology: 'Eye specialist for vision care and surgery.',
  Sports:        'Sports medicine and athlete performance specialist.',
  Gynecology:    "Women's health and reproductive system specialist.",
  Orthopedics:   'Bone, joint, and musculoskeletal specialist.',
  Pulmonology:   'Lung and respiratory system specialist.',
  General:       'General physician providing broad care and consultation.',
  Dermatology:   'Skin, hair, and nail health specialist.',
  Psychiatry:    'Mental health and behavior specialist.',
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=Nunito+Sans:wght@300;400;600&display=swap');

  .doc-wrap {
    font-family: 'Nunito Sans', sans-serif;
    min-height: 100vh;
    background: #e8ecf6;
    padding: 2rem 1rem 3rem;
  }

  .doc-card {
    max-width: 660px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #c8d0e8;
    box-shadow: 0 2px 4px rgba(30,50,120,0.07), 0 12px 40px rgba(30,50,120,0.10);
    overflow: hidden;
  }

  .doc-head {
    padding: 2rem 2.25rem 1.75rem;
    border-bottom: 1px solid #dde3f4;
    background: #f4f6fd;
  }
  .doc-head-kicker {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6878c0;
    margin-bottom: 6px;
  }
  .doc-head h1 {
    font-family: 'Nunito', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f1e4a;
    margin: 0 0 6px;
    letter-spacing: -0.01em;
  }
  .doc-head p {
    font-size: 13.5px;
    color: #6878a8;
    margin: 0;
    line-height: 1.6;
  }

  .doc-body {
    padding: 1.75rem 2.25rem 2.25rem;
    background: #fff;
  }

  .step-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #8892c0;
    margin: 1.5rem 0 0.85rem;
  }
  .step-label:first-child { margin-top: 0; }
  .step-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #dde3f4;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .field label {
    font-size: 12.5px;
    font-weight: 600;
    color: #3a4a7a;
  }

  .inp {
    width: 100%;
    box-sizing: border-box;
    border: 1.5px solid #c8d0e8;
    border-radius: 9px;
    padding: 9px 13px;
    font-size: 13.5px;
    font-family: 'Nunito Sans', sans-serif;
    color: #0f1e4a;
    background: #f6f8fd;
    outline: none;
    transition: border-color 0.16s, box-shadow 0.16s, background 0.16s;
  }
  .inp:focus {
    border-color: #4a5fc4;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(74,95,196,0.13);
  }
  .inp::placeholder { color: #a0aacf; }
  .inp-area {
    resize: vertical;
    min-height: 86px;
    line-height: 1.6;
  }

  .gender-row {
    display: flex;
    border: 1.5px solid #c8d0e8;
    border-radius: 9px;
    overflow: hidden;
    background: #f6f8fd;
  }
  .gender-opt {
    flex: 1;
    border: none;
    background: transparent;
    font-family: 'Nunito Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #6878a8;
    padding: 9px 6px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .gender-opt.on {
    background: #3d52c4;
    color: #fff;
  }

  .pill-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .pill {
    border: 1.5px solid #c8d0e8;
    border-radius: 7px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #3a4a7a;
    background: #f4f6fd;
    cursor: pointer;
    transition: all 0.15s;
    user-select: none;
    white-space: nowrap;
  }
  .pill:hover {
    border-color: #4a5fc4;
    color: #1e2f80;
    background: #eaedfa;
  }
  .pill.on {
    border-color: #3d52c4;
    background: #3d52c4;
    color: #fff;
    box-shadow: 0 2px 8px rgba(61,82,196,0.25);
  }
  .pill-hint {
    margin-top: 9px;
    padding: 9px 13px;
    border-radius: 8px;
    background: #eaedfa;
    border-left: 3px solid #4a5fc4;
    font-size: 12.5px;
    color: #1e2f80;
    line-height: 1.5;
  }

  .file-zone {
    position: relative;
    border: 1.5px dashed #a8b4d8;
    border-radius: 10px;
    background: #f4f6fd;
    padding: 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.16s, background 0.16s;
    display: block;
  }
  .file-zone:hover {
    border-color: #4a5fc4;
    background: #eaedfa;
  }
  .file-zone input {
    position: absolute; inset: 0;
    opacity: 0; cursor: pointer;
    width: 100%; height: 100%;
  }
  .file-zone svg {
    display: block;
    margin: 0 auto 8px;
    color: #4a5fc4;
  }
  .file-zone p { margin: 0; font-size: 13px; color: #6878a8; line-height: 1.6; }
  .file-zone strong { color: #3d52c4; }
  .file-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 9px;
    padding: 6px 12px;
    background: #eaedfa;
    border: 1px solid #a8b4d8;
    border-radius: 6px;
    font-size: 12.5px;
    color: #1e2f80;
    font-weight: 600;
  }
  .file-preview {
    margin-top: 10px;
    border-radius: 8px;
    max-width: 160px;
    border: 1.5px solid #c8d0e8;
    display: block;
  }

  .alert {
    display: flex;
    gap: 9px;
    align-items: flex-start;
    padding: 11px 14px;
    border-radius: 9px;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 1.25rem;
  }
  .alert.ok  { background: #f0faf4; border: 1px solid #b6e8cc; color: #1d6a3e; }
  .alert.err { background: #fff5f5; border: 1px solid #fcc; color: #c0392b; }

  .doc-submit {
    margin-top: 1.5rem;
    width: 100%;
    border: none;
    border-radius: 10px;
    padding: 13px;
    font-size: 14.5px;
    font-weight: 700;
    font-family: 'Nunito', sans-serif;
    letter-spacing: 0.01em;
    cursor: pointer;
    background: #3d52c4;
    color: #fff;
    box-shadow: 0 3px 10px rgba(61,82,196,0.30);
    transition: background 0.16s, box-shadow 0.16s, transform 0.1s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .doc-submit:hover:not(:disabled) {
    background: #2e40a8;
    box-shadow: 0 5px 16px rgba(61,82,196,0.38);
    transform: translateY(-1px);
  }
  .doc-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .doc-footer {
    text-align: center;
    margin-top: 1.25rem;
    font-size: 12px;
    color: #8892c0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.9s linear infinite; }

  @media (max-width: 580px) {
    .doc-head, .doc-body { padding-left: 1.25rem; padding-right: 1.25rem; }
    .grid-2 { grid-template-columns: 1fr; }
    .pill { font-size: 12px; padding: 5px 11px; }
  }
`

export default function AddDoc() {
  const user = useSelector(s => s.auth.userData)
  const isAdmin = user?.role === 'admin'

  const [form, setForm] = useState({
    name: '', email: '', password: '', specialty: '',
    title: '', degree: '', description: '', gender: 'male',
    availability: 'Mon – Fri, 9:00 AM – 5:00 PM', zone: 'Online',
  })
  const [licenseFile, setLicenseFile] = useState(null)
  const [licensePreview, setLicensePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const pickSpecialty = (val) => {
    set('specialty', val)
    if (val !== 'Other') {
      set('title', val === 'Sports' ? 'Sports Medicine' : val)
      set('description', specialtyDescriptions[val] || '')
    }
  }

  const onFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setLicenseFile(f)
    if (f.type.startsWith('image/')) {
      const r = new FileReader()
      r.onloadend = () => setLicensePreview(r.result)
      r.readAsDataURL(f)
    } else setLicensePreview(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMsg({ text: '', type: '' })
    try {
      let licenseFileId = ''
      if (licenseFile) {
        const fd = new FormData()
        fd.append('file', licenseFile)
        const up = await fetch(`${api.apiBaseUrl}/uploads`, { method: 'POST', body: fd })
        if (!up.ok) throw new Error('File upload failed')
        const upData = await up.json()
        licenseFileId = upData.fileId || upData.id || upData.filename
      }
      const res = await fetch(`${api.apiBaseUrl}/doctor-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, licenseTemplate: licenseFileId }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setMsg({ text: 'Application submitted successfully. Our team will review it and activate your account within 2–3 business days.', type: 'ok' })
      setForm({ name: '', email: '', password: '', specialty: '', title: '', degree: '', description: '', gender: 'male', availability: 'Mon – Fri, 9:00 AM – 5:00 PM', zone: 'Online' })
      setLicenseFile(null); setLicensePreview(null)
    } catch (err) {
      setMsg({ text: err.message || 'Something went wrong. Please try again.', type: 'err' })
    } finally {
      setSubmitting(false)
    }
  }

  if (isAdmin) return null

  return (
    <>
      <style>{css}</style>
      <div className="doc-wrap">
        <div className="doc-card">

          <div className="doc-head">
            <div className="doc-head-kicker">HealthHub · Doctor Portal</div>
            <h1>Apply to Join Our Network</h1>
            <p>Fill in your details below. Applications are reviewed within 2–3 business days.</p>
          </div>

          <div className="doc-body">
            {msg.text && (
              <div className={`alert ${msg.type}`}>
                <span>{msg.type === 'ok' ? '✓' : '!'}</span>
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={onSubmit}>

              <div className="step-label">Personal Information</div>
              <div className="grid-2" style={{ marginBottom: '0.75rem' }}>
                <div className="field">
                  <label>Full Name</label>
                  <input className="inp" placeholder="Dr. Jane Smith" value={form.name}
                    onChange={e => set('name', e.target.value)} required />
                </div>
                <div className="field">
                  <label>Gender</label>
                  <div className="gender-row">
                    <button type="button" className={`gender-opt ${form.gender === 'male' ? 'on' : ''}`}
                      onClick={() => set('gender', 'male')}>Male</button>
                    <button type="button" className={`gender-opt ${form.gender === 'female' ? 'on' : ''}`}
                      onClick={() => set('gender', 'female')}>Female</button>
                  </div>
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Email Address</label>
                  <input className="inp" type="email" placeholder="jane@clinic.com" value={form.email}
                    onChange={e => set('email', e.target.value)} required />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input className="inp" type="password" placeholder="Create a password" value={form.password}
                    onChange={e => set('password', e.target.value)} required />
                </div>
              </div>

              <div className="step-label">Medical Specialty</div>
              <div className="pill-wrap">
                {specialtyOptions.map(o => (
                  <div key={o.value} className={`pill ${form.specialty === o.value ? 'on' : ''}`}
                    onClick={() => pickSpecialty(o.value)}>
                    {o.label}
                  </div>
                ))}
              </div>
              {form.specialty && specialtyDescriptions[form.specialty] && (
                <div className="pill-hint">{specialtyDescriptions[form.specialty]}</div>
              )}

              <div style={{ marginTop: '0.85rem' }} />
              <div className="grid-2">
                <div className="field">
                  <label>Specialty Title</label>
                  <input className="inp" placeholder="e.g. Cardiologist" value={form.title}
                    onChange={e => set('title', e.target.value)} required />
                </div>
                <div className="field">
                  <label>Degree / Qualification</label>
                  <input className="inp" placeholder="e.g. MBBS, MD" value={form.degree}
                    onChange={e => set('degree', e.target.value)} required />
                </div>
              </div>
              <div className="field" style={{ marginTop: '0.75rem' }}>
                <label>Professional Bio</label>
                <textarea className="inp inp-area"
                  placeholder="Briefly describe your experience, approach, and areas of focus…"
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>

              <div className="step-label">Availability & Location</div>
              <div className="grid-2">
                <div className="field">
                  <label>Availability</label>
                  <input className="inp" placeholder="Mon – Fri, 9 AM – 5 PM" value={form.availability}
                    onChange={e => set('availability', e.target.value)} />
                </div>
                <div className="field">
                  <label>Zone / Location</label>
                  <input className="inp" placeholder="e.g. New York, Online" value={form.zone}
                    onChange={e => set('zone', e.target.value)} />
                </div>
              </div>

              <div className="step-label">Medical License</div>
              <label className="file-zone">
                <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={onFile} />
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p><strong>Click to upload</strong> or drag and drop</p>
                <p style={{ fontSize: '11.5px', marginTop: '3px' }}>Image, PDF or DOC · Max 10 MB</p>
              </label>
              {licensePreview && <img src={licensePreview} alt="Preview" className="file-preview" />}
              {licenseFile && !licensePreview && (
                <div className="file-tag">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {licenseFile.name}
                </div>
              )}

              <button className="doc-submit" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Submitting…
                  </>
                ) : 'Submit Application'}
              </button>

            </form>
          </div>
        </div>

        <div className="doc-footer">
          Questions? Contact <span style={{ color: '#3d52c4' }}>support@healthhub.com</span>
        </div>
      </div>
    </>
  )
}
