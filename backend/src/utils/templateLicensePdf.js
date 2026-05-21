import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

function ascii85Decode(input) {
  const text = String(input || '').replace(/\s+/g, '')
  const clean = text.endsWith('~>') ? text.slice(0, -2) : text
  const bytes = []
  let chunk = []

  for (const ch of clean) {
    if (ch === 'z' && chunk.length === 0) {
      bytes.push(0, 0, 0, 0)
      continue
    }
    chunk.push(ch.charCodeAt(0) - 33)
    if (chunk.length === 5) {
      let value = 0
      for (const part of chunk) value = value * 85 + part
      bytes.push((value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255)
      chunk = []
    }
  }

  if (chunk.length) {
    const originalLength = chunk.length
    while (chunk.length < 5) chunk.push(84)
    let value = 0
    for (const part of chunk) value = value * 85 + part
    const tmp = [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255]
    bytes.push(...tmp.slice(0, originalLength - 1))
  }

  return Buffer.from(bytes)
}

function escapePdfText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function formatIssueDate() {
  return new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatExpiryDate() {
  const expiry = new Date()
  expiry.setFullYear(expiry.getFullYear() + 5)
  return expiry.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function normalizeDoctorName(name) {
  if (!name) return ''
  return /^dr\./i.test(name.trim()) ? name.trim() : `Dr. ${name.trim()}`
}

function replaceAll(source, search, replacement) {
  return source.split(search).join(replacement)
}

function buildPdfBuffer(contentStream) {
  const streamLength = Buffer.byteLength(contentStream, 'latin1')
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Count 1 /Kids [5 0 R] >>\nendobj\n',
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding /Name /F1 >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding /Name /F2 >>\nendobj\n',
    '5 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 595.2756 841.8898 ] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'))
    pdf += object
  }

  const xrefOffset = Buffer.byteLength(pdf, 'latin1')
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return Buffer.from(pdf, 'latin1')
}

export function generateMedicalLicenseFromTemplate({
  templatePath,
  outputPath,
  name,
  title,
  degree,
  email,
  zone,
  licenseNumber,
}) {
  const pdf = fs.readFileSync(templatePath)
  const pdfText = pdf.toString('latin1')
  const objectMatch = pdfText.match(/8 0 obj[\s\S]*?endstream\s*endobj/)
  if (!objectMatch) {
    throw new Error('Unsupported PDF template format')
  }
  const streamMatch = objectMatch[0].match(/stream\r?\n([\s\S]*?)endstream/)
  if (!streamMatch) throw new Error('Unsupported PDF template stream')

  const decodedStream = zlib.inflateSync(ascii85Decode(streamMatch[1].trim())).toString('latin1')
  const issuingAuthority = degree ? `HealthHub Medical Council - ${degree}` : 'HealthHub Medical Council'
  const footerLine1 = 'This medical license was generated from the uploaded doctor template and personalized'
  const footerLine2 = 'with live application details for HealthHub verification.'

  let personalized = decodedStream
  personalized = replaceAll(personalized, 'DEMO MEDICAL PRACTITIONER LICENSE', escapePdfText('HEALTHHUB MEDICAL LICENSE'))
  personalized = replaceAll(personalized, 'Dr. Jatin Kumar', escapePdfText(normalizeDoctorName(name)))
  personalized = replaceAll(personalized, 'General Physician', escapePdfText(title || 'General Physician'))
  personalized = replaceAll(personalized, 'DEMO-MCI-2026-001', escapePdfText(licenseNumber))
  personalized = replaceAll(personalized, 'Demo Medical Council of India', escapePdfText(issuingAuthority))
  personalized = replaceAll(personalized, '01 January 2024', escapePdfText(formatIssueDate()))
  personalized = replaceAll(personalized, '01 January 2029', escapePdfText(formatExpiryDate()))
  personalized = replaceAll(personalized, 'ACTIVE \\(DEMO ONLY\\)', escapePdfText(`ACTIVE | ${degree || 'Verified Degree'}`))
  personalized = replaceAll(
    personalized,
    'This is a SAMPLE / DEMO LICENSE generated for educational and project demonstration',
    escapePdfText(footerLine1),
  )
  personalized = replaceAll(
    personalized,
    'purposes only. Not valid for real medical practice.',
    escapePdfText(`${email || ''}${email && zone ? ' | ' : ''}${zone || ''} | ${footerLine2}`),
  )

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, buildPdfBuffer(personalized))
}

