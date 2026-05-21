import fs from 'fs'
import path from 'path'

function escapePdfText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ')
}

function splitText(value, maxLength = 60) {
  const words = String(value || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ['']
  const lines = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxLength) {
      if (current) lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines
}

function buildContentStream(data) {
  const issuedOn = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const summaryLines = splitText(
    `${data.name} is recognized by HealthHub as a verified medical professional in ${data.title}.`,
    62,
  )

  const content = [
    '0.93 0.97 1 rg',
    '36 36 523 770 re f',
    '0.12 0.33 0.64 RG',
    '3 w',
    '42 42 511 758 re S',
    '0.15 0.49 0.78 rg',
    '42 700 511 100 re f',
    'BT /F1 26 Tf 58 758 Td (HealthHub Medical License) Tj ET',
    'BT /F1 12 Tf 58 734 Td (Official doctor verification certificate) Tj ET',
    '0.16 0.21 0.3 rg',
    'BT /F1 15 Tf 58 662 Td (Certified Doctor Name) Tj ET',
    `BT /F1 22 Tf 58 634 Td (${escapePdfText(data.name)}) Tj ET`,
    'BT /F1 12 Tf 58 592 Td (License Number) Tj ET',
    `BT /F1 16 Tf 58 570 Td (${escapePdfText(data.licenseNumber)}) Tj ET`,
    'BT /F1 12 Tf 58 532 Td (Medical Specialization) Tj ET',
    `BT /F1 16 Tf 58 510 Td (${escapePdfText(data.title)}) Tj ET`,
    'BT /F1 12 Tf 58 472 Td (Degree Information) Tj ET',
    `BT /F1 16 Tf 58 450 Td (${escapePdfText(data.degree)}) Tj ET`,
    'BT /F1 12 Tf 58 412 Td (Registered Email) Tj ET',
    `BT /F1 16 Tf 58 390 Td (${escapePdfText(data.email)}) Tj ET`,
    'BT /F1 12 Tf 58 352 Td (Practice Zone) Tj ET',
    `BT /F1 16 Tf 58 330 Td (${escapePdfText(data.zone)}) Tj ET`,
    'BT /F1 12 Tf 58 292 Td (Issued On) Tj ET',
    `BT /F1 16 Tf 58 270 Td (${escapePdfText(issuedOn)}) Tj ET`,
  ]

  let y = 210
  for (const line of summaryLines) {
    content.push(`BT /F1 13 Tf 58 ${y} Td (${escapePdfText(line)}) Tj ET`)
    y -= 20
  }

  content.push('BT /F1 12 Tf 58 118 Td (Authorized by HealthHub Credentialing Desk) Tj ET')
  content.push('BT /F1 12 Tf 58 90 Td (This document was generated automatically from the doctor application form.) Tj ET')

  return content.join('\n')
}

function buildPdfBuffer(contentStream) {
  const streamLength = Buffer.byteLength(contentStream, 'utf8')
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += object
  }
  const xrefOffset = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return Buffer.from(pdf, 'utf8')
}

export function generateMedicalLicensePdf(data, outputPath) {
  const contentStream = buildContentStream(data)
  const buffer = buildPdfBuffer(contentStream)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, buffer)
}

