import jsPDF from 'jspdf'

const ACCENT = [91, 108, 247]
const DARK   = [7, 9, 15]
const CARD   = [17, 24, 39]
const TEXT   = [226, 232, 240]
const DIM    = [139, 146, 165]
const EMERALD = [16, 185, 129]
const ROSE   = [244, 63, 94]

function hex(rgb) {
  return `#${rgb.map(v => v.toString(16).padStart(2,'0')).join('')}`
}

function scoreColor(score) {
  if (score >= 8) return EMERALD
  if (score >= 5) return ACCENT
  return ROSE
}

export function exportReportPDF(report) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const MARGIN = 14
  const COL = W - MARGIN * 2
  let y = 0

  // ── helpers ──────────────────────────────────────────────────────────────
  const setFont = (size, style = 'normal', color = TEXT) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.setTextColor(...color)
  }

  const fillRect = (x, ry, w, h, color) => {
    doc.setFillColor(...color)
    doc.roundedRect(x, ry, w, h, 2, 2, 'F')
  }

  const line = (color = [30, 37, 53]) => {
    doc.setDrawColor(...color)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, y, W - MARGIN, y)
    y += 5
  }

  const wrap = (text, x, ry, maxW, lineH = 5) => {
    const lines = doc.splitTextToSize(String(text || ''), maxW)
    doc.text(lines, x, ry)
    return lines.length * lineH
  }

  const checkPage = (needed = 20) => {
    if (y + needed > 280) {
      doc.addPage()
      fillRect(0, 0, W, 297, DARK)
      y = MARGIN
    }
  }

  const sectionHeader = (label) => {
    checkPage(14)
    y += 4
    fillRect(MARGIN, y, COL, 8, [17, 24, 39])
    setFont(7, 'bold', ACCENT)
    doc.text(label.toUpperCase(), MARGIN + 4, y + 5.5)
    y += 12
  }

  const bullet = (text, color = DIM) => {
    checkPage(8)
    setFont(8, 'normal', color)
    doc.text('•', MARGIN + 2, y)
    const h = wrap(text, MARGIN + 7, y, COL - 7, 4.5)
    y += Math.max(h, 5) + 2
  }

  // ── Cover ─────────────────────────────────────────────────────────────────
  fillRect(0, 0, W, 297, DARK)

  // Header bar
  fillRect(0, 0, W, 42, CARD)
  doc.setFillColor(...ACCENT)
  doc.rect(0, 0, 3, 42, 'F')

  setFont(7, 'normal', DIM)
  doc.text('SCOUTLY  ·  B2B INTELLIGENCE REPORT', MARGIN + 4, 12)

  setFont(22, 'bold', TEXT)
  doc.text(report.company.name || 'Unknown', MARGIN + 4, 28)

  if (report.company.tagline) {
    setFont(9, 'normal', DIM)
    doc.text(report.company.tagline, MARGIN + 4, 36)
  }

  // Intent badge
  const intentLabel = (report.intent || 'general').replace('_', ' ').toUpperCase()
  fillRect(W - 50, 14, 36, 8, ACCENT)
  setFont(6, 'bold', [255,255,255])
  doc.text(intentLabel, W - 50 + 18, 19.5, { align: 'center' })

  y = 52

  // ── Strategic headline (hero callout) ─────────────────────────────────────
  const sa = report.strategic_analysis
  fillRect(MARGIN, y, COL, 28, [14, 17, 31])
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, y, MARGIN, y + 28)

  setFont(7, 'bold', ACCENT)
  doc.text('KEY INSIGHT', MARGIN + 4, y + 7)
  setFont(9, 'normal', TEXT)
  const hLines = doc.splitTextToSize(sa.headline || '', COL - 10)
  doc.text(hLines, MARGIN + 4, y + 14)
  y += 34

  // ── Score pill ────────────────────────────────────────────────────────────
  const score = sa.strategic_fit_score || 0
  const sc = scoreColor(score)
  fillRect(MARGIN, y, 38, 16, CARD)
  setFont(7, 'bold', DIM)
  doc.text('STRATEGIC FIT', MARGIN + 4, y + 6)
  setFont(14, 'bold', sc)
  doc.text(`${score}/10`, MARGIN + 4, y + 13.5)

  // Score bar
  const barX = MARGIN + 42, barY = y + 8, barW = COL - 44
  fillRect(barX, barY, barW, 4, [30, 37, 53])
  fillRect(barX, barY, (barW * score) / 10, 4, sc)

  setFont(7, 'normal', DIM)
  const rLines = doc.splitTextToSize(sa.reasoning || '', COL - 44)
  doc.text(rLines, barX, y + 4)
  y += 22

  // ── Company meta row ──────────────────────────────────────────────────────
  const c = report.company
  const meta = [
    ['Industry',  c.industry],
    ['Size',      c.size],
    ['Founded',   c.founded],
    ['HQ',        c.headquarters],
  ].filter(([, v]) => v)

  fillRect(MARGIN, y, COL, 18, CARD)
  const colW = COL / meta.length
  meta.forEach(([label, value], i) => {
    const cx = MARGIN + i * colW + 4
    setFont(6, 'bold', DIM)
    doc.text(label.toUpperCase(), cx, y + 6)
    setFont(8, 'normal', TEXT)
    doc.text(String(value).substring(0, 22), cx, y + 13)
  })
  y += 24

  // ── Description ───────────────────────────────────────────────────────────
  sectionHeader('About')
  setFont(8.5, 'normal', TEXT)
  y += wrap(c.description, MARGIN, y, COL, 5) + 4

  // ── Products ──────────────────────────────────────────────────────────────
  const p = report.products
  sectionHeader('Products & Services')

  if (p.target_customers) {
    setFont(7, 'bold', DIM)
    doc.text('TARGET CUSTOMERS', MARGIN, y)
    y += 5
    setFont(8, 'normal', TEXT)
    y += wrap(p.target_customers, MARGIN, y, COL) + 4
  }

  if (p.pricing_model) {
    setFont(7, 'bold', DIM)
    doc.text('PRICING MODEL', MARGIN, y)
    y += 5
    setFont(8, 'normal', TEXT)
    y += wrap(p.pricing_model, MARGIN, y, COL) + 4
  }

  if (p.products?.length) {
    setFont(7, 'bold', DIM)
    doc.text('PRODUCTS', MARGIN, y)
    y += 6
    // Pill-style product tags
    let px = MARGIN, tagY = y
    p.products.forEach(prod => {
      const tw = doc.getTextWidth(prod) + 8
      if (px + tw > W - MARGIN) { px = MARGIN; tagY += 9 }
      fillRect(px, tagY - 4, tw, 7, [17, 24, 45])
      setFont(7, 'normal', TEXT)
      doc.text(prod, px + 4, tagY + 0.5)
      px += tw + 3
    })
    y = tagY + 10
  }

  if (p.key_differentiators?.length) {
    setFont(7, 'bold', DIM)
    doc.text('DIFFERENTIATORS', MARGIN, y)
    y += 6
    p.key_differentiators.forEach(d => bullet(d, TEXT))
  }

  // ── Opportunities & Risks ─────────────────────────────────────────────────
  sectionHeader('Strategic Analysis')

  const half = (COL / 2) - 2
  checkPage(40)
  fillRect(MARGIN, y, half, 8, [12, 40, 28])
  fillRect(MARGIN + half + 4, y, half, 8, [40, 12, 20])
  setFont(7, 'bold', EMERALD)
  doc.text('OPPORTUNITIES', MARGIN + 4, y + 5.5)
  setFont(7, 'bold', ROSE)
  doc.text('RISKS', MARGIN + half + 8, y + 5.5)
  y += 12

  const opps = sa.opportunities || []
  const risks = sa.risks || []
  const maxRows = Math.max(opps.length, risks.length)

  for (let i = 0; i < maxRows; i++) {
    checkPage(10)
    if (opps[i]) {
      setFont(7.5, 'normal', TEXT)
      doc.text('✓', MARGIN + 1, y)
      wrap(opps[i], MARGIN + 5, y, half - 6)
    }
    if (risks[i]) {
      setFont(7.5, 'normal', TEXT)
      doc.text('✗', MARGIN + half + 5, y)
      wrap(risks[i], MARGIN + half + 9, y, half - 6)
    }
    y += 9
  }

  // ── Recent Developments ───────────────────────────────────────────────────
  const rd = report.recent_developments
  if (rd?.items?.length || rd?.growth_signals?.length) {
    sectionHeader('Recent Developments')
    ;(rd.items || []).forEach(item => bullet(item, TEXT))
    if (rd.growth_signals?.length) {
      y += 2
      setFont(7, 'bold', DIM)
      checkPage(8)
      doc.text('GROWTH SIGNALS', MARGIN, y)
      y += 6
      ;(rd.growth_signals || []).forEach(g => bullet(g, EMERALD))
    }
    if (rd.funding_mentions) {
      checkPage(10)
      fillRect(MARGIN, y, COL, 10, [12, 30, 22])
      setFont(7, 'bold', EMERALD)
      doc.text('FUNDING  ', MARGIN + 4, y + 7)
      setFont(7, 'normal', TEXT)
      doc.text(rd.funding_mentions, MARGIN + 24, y + 7)
      y += 14
    }
  }

  // ── Key People ────────────────────────────────────────────────────────────
  if (report.key_people?.length) {
    sectionHeader('Key People')
    report.key_people.forEach(person => bullet(person, TEXT))
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    fillRect(0, 285, W, 12, CARD)
    setFont(6, 'normal', DIM)
    doc.text(
      `BizwizHack Intelligence  ·  Generated ${new Date(report.generated_at).toLocaleDateString()}  ·  Page ${i} of ${pageCount}`,
      W / 2, 292,
      { align: 'center' }
    )
    if (report.raw_sources?.[0]) {
      doc.text(`Source: ${report.raw_sources[0]}`, MARGIN, 292)
    }
  }

  const filename = `BizwizHack_${(report.company.name || 'Report').replace(/\s+/g, '_')}_${Date.now()}.pdf`
  doc.save(filename)
}
