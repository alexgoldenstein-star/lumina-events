const XLSX = require('xlsx')

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { base64, filename } = req.body
    if (!base64) return res.status(400).json({ error: 'No file data' })

    const buffer = Buffer.from(base64, 'base64')
    const wb = XLSX.read(buffer, { type: 'buffer' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

    res.status(200).json({ rows, sheetName: wb.SheetNames[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
