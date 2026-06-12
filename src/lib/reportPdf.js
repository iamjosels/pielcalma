/**
 * Generador de PDF premium del Reporte PielCalma (vectorial, texto seleccionable).
 * Documento tipo informe clínico: membrete, barra de paciente, tiles de métricas,
 * gráfico de tendencia dibujado en vectores, tabla con cabecera y filas zebra,
 * secciones con viñetas de acento y pie con paginación + disclaimer.
 *
 * Uso: const doc = await buildReportPdf(data); doc.save() / doc.autoPrint().
 */

const C = {
  navy: [37, 50, 75],
  navySoft: [70, 84, 112],
  accent: [107, 91, 214],
  accentSoft: [220, 215, 255],
  lavWash: [238, 236, 251],
  green: [223, 245, 234],
  peach: [255, 230, 217],
  cream: [255, 248, 239],
  creamCard: [255, 252, 247],
  ink: [43, 42, 51],
  muted: [111, 102, 128],
  faint: [154, 147, 166],
  hair: [233, 223, 205],
  white: [255, 255, 255],
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function fmtDay(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function fmtRange(week) {
  const withData = week.filter((w) => w.date);
  if (!withData.length) return "";
  const a = withData[0].date;
  const b = withData[withData.length - 1].date;
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  const left = `${da.getDate()}`;
  const right = `${db.getDate()} ${MONTHS[db.getMonth()]} ${db.getFullYear()}`;
  return da.getMonth() === db.getMonth() ? `${left}–${right}` : `${fmtDay(a)} – ${fmtDay(b)} ${db.getFullYear()}`;
}
function fmtNow(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
const dash = (s) => (s === "—" || s == null ? "—" : s);

export async function buildReportPdf(data) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 46;
  const CW = W - 2 * M;
  const BOTTOM = H - 58; // límite antes del pie

  const {
    profile = {},
    metrics = {},
    calma = 0,
    week = [],
    sleep = [],
    resumen = "",
    patterns = [],
    questions = [],
    observations = [],
    generatedAt = new Date(),
  } = data;

  let y = 0;

  // ---------- helpers ----------
  const setColor = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const setFill = (c) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c) => doc.setDrawColor(c[0], c[1], c[2]);

  function eyebrow(text, x, yy, color = C.accent) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setColor(color);
    doc.text(text.toUpperCase(), x, yy, { charSpace: 1.4 });
  }

  function ensure(space) {
    if (y + space > BOTTOM) {
      doc.addPage();
      y = M + 6;
    }
  }

  // ---------- membrete ----------
  function header() {
    // monograma
    setFill(C.accentSoft);
    doc.roundedRect(M, 40, 26, 26, 7, 7, "F");
    setColor(C.accent);
    doc.setFont("times", "bold");
    doc.setFontSize(15);
    doc.text("P", M + 13, 58, { align: "center" });

    // wordmark
    setColor(C.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PielCalma", M + 36, 52);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(C.muted);
    doc.text("Bitácora inteligente de cuidado familiar", M + 36, 63);

    // derecha (alineado a la derecha)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setColor(C.muted);
    doc.text("REPORTE DE SEGUIMIENTO", W - M, 48, { align: "right", charSpace: 1.4 });
    doc.setFontSize(9.5);
    setColor(C.navy);
    doc.text(fmtRange(week) || "Semana de seguimiento", W - M, 62, { align: "right" });

    // regla
    setDraw(C.hair);
    doc.setLineWidth(0.8);
    doc.line(M, 78, W - M, 78);
    setDraw(C.accent);
    doc.setLineWidth(1.6);
    doc.line(M, 78, M + 54, 78);

    y = 100;
  }

  // ---------- barra de paciente ----------
  function patientBar() {
    const h = 58;
    setFill(C.creamCard);
    setDraw(C.hair);
    doc.setLineWidth(0.8);
    doc.roundedRect(M, y, CW, h, 10, 10, "FD");

    const fields = [
      ["Cuidadora", profile.caregiverName || "—"],
      ["Niño/a", profile.childName || "—"],
      ["Edad", profile.childAge ? `${profile.childAge} años` : "—"],
      ["Condición registrada", profile.conditionLabel || "—"],
    ];
    const colW = CW / fields.length;
    fields.forEach(([label, value], i) => {
      const x = M + 16 + i * colW;
      if (i > 0) {
        setDraw(C.hair);
        doc.setLineWidth(0.6);
        doc.line(M + i * colW, y + 12, M + i * colW, y + h - 12);
      }
      eyebrow(label, x, y + 22, C.muted);
      setColor(C.navy);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12.5);
      const vlines = doc.splitTextToSize(value, colW - 24).slice(0, 2);
      vlines.forEach((ln, li) => doc.text(ln, x, y + 39 + li * 12));
    });
    y += h + 22;
  }

  // ---------- título + resumen ----------
  function summary() {
    eyebrow("Resumen de la semana", M, y);
    y += 16;
    doc.setFont("times", "bold");
    doc.setFontSize(21);
    setColor(C.navy);
    doc.text("Lo importante de esta semana", M, y);
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    setColor(C.navySoft);
    const lines = doc.splitTextToSize(resumen || "Resumen no disponible.", CW);
    lines.forEach((ln) => {
      doc.text(ln, M, y);
      y += 15;
    });
    y += 14;
  }

  // ---------- tiles de métricas ----------
  function kpis() {
    const tiles = [
      { label: "Días registrados", value: `${metrics.registeredDays ?? 0}/7`, fill: C.creamCard, border: true },
      { label: "Comezón alta", value: `${metrics.highItchDays ?? 0}`, sub: "días 7/10 o más", fill: C.accentSoft },
      { label: "Sueño afectado", value: `${metrics.affectedSleepNights ?? 0}`, sub: "noches", fill: C.green },
      { label: "Calma Familiar", value: `${calma}`, sub: "de 100", fill: C.peach },
    ];
    const gap = 12;
    const tw = (CW - gap * 3) / 4;
    const th = 66;
    ensure(th + 10);
    tiles.forEach((t, i) => {
      const x = M + i * (tw + gap);
      setFill(t.fill);
      if (t.border) {
        setDraw(C.hair);
        doc.setLineWidth(0.8);
        doc.roundedRect(x, y, tw, th, 9, 9, "FD");
      } else {
        doc.roundedRect(x, y, tw, th, 9, 9, "F");
      }
      eyebrow(t.label, x + 12, y + 18, C.navySoft);
      setColor(C.navy);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(String(t.value), x + 12, y + 44);
      if (t.sub) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        setColor(C.navySoft);
        doc.text(t.sub, x + 12, y + 56);
      }
    });
    y += th + 24;
  }

  // ---------- gráfico de tendencia (vectorial) ----------
  function chart() {
    const boxH = 168;
    ensure(boxH + 10);
    setFill(C.creamCard);
    setDraw(C.hair);
    doc.setLineWidth(0.8);
    doc.roundedRect(M, y, CW, boxH, 10, 10, "FD");

    const padL = 22;
    const padTop = 40;
    const padBot = 28;
    const x0 = M + padL + 14;
    const plotW = CW - padL - 28;
    const yTop = y + padTop;
    const plotH = boxH - padTop - padBot;
    const base = yTop + plotH;
    const xAt = (i) => x0 + (plotW * i) / 6;
    const yAt = (v) => yTop + plotH * (1 - v / 10);

    eyebrow("Evolución registrada", M + 16, y + 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setColor(C.navy);
    doc.text("Comezón reportada por día", M + 16, y + 33);

    // gridlines + etiquetas Y
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    [0, 5, 10].forEach((v) => {
      const gy = yAt(v);
      setDraw(C.hair);
      doc.setLineWidth(0.5);
      doc.line(x0, gy, x0 + plotW, gy);
      setColor(C.faint);
      doc.text(String(v), x0 - 8, gy + 2.5, { align: "right" });
    });

    const pts = week.map((d, i) => ({ i, v: d.itch })).filter((p) => p.v != null);

    // área bajo la línea (triángulos)
    setFill(C.lavWash);
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k];
      const b = pts[k + 1];
      const ax = xAt(a.i);
      const bx = xAt(b.i);
      const ay = yAt(a.v);
      const by = yAt(b.v);
      doc.triangle(ax, ay, ax, base, bx, base, "F");
      doc.triangle(ax, ay, bx, base, bx, by, "F");
    }

    // línea
    setDraw(C.accent);
    doc.setLineWidth(1.8);
    for (let k = 0; k < pts.length - 1; k++) {
      doc.line(xAt(pts[k].i), yAt(pts[k].v), xAt(pts[k + 1].i), yAt(pts[k + 1].v));
    }
    // puntos
    pts.forEach((p) => {
      setFill(C.creamCard);
      doc.circle(xAt(p.i), yAt(p.v), 3.4, "F");
      setFill(C.accent);
      doc.circle(xAt(p.i), yAt(p.v), 2, "F");
    });

    // etiquetas X
    setColor(C.muted);
    doc.setFontSize(8);
    week.forEach((d, i) => {
      doc.text(d.day, xAt(i), base + 16, { align: "center" });
    });

    y += boxH + 14;
  }

  // ---------- distribución de sueño ----------
  function sleepBars() {
    const total = sleep.reduce((a, b) => a + b.value, 0) || 1;
    ensure(74);
    eyebrow("Sueño · noches registradas", M, y);
    y += 16;
    const rowH = 16;
    sleep.forEach((s) => {
      const barX = M + 70;
      const barW = CW - 70 - 50;
      setColor(C.navy);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(s.label, M, y + 4);
      // track
      setFill(C.cream);
      doc.roundedRect(barX, y - 4, barW, 7, 3.5, 3.5, "F");
      // fill
      const w = Math.max(2, (barW * s.value) / 7);
      setFill(C.accent);
      doc.roundedRect(barX, y - 4, w, 7, 3.5, 3.5, "F");
      setColor(C.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`${s.value} noche${s.value === 1 ? "" : "s"}`, W - M, y + 3, { align: "right" });
      y += rowH;
    });
    y += 12;
  }

  // ---------- tabla semanal ----------
  function table() {
    const cols = [
      { k: "day", t: "Día", w: 56, b: true },
      { k: "itch", t: "Comezón", w: 70 },
      { k: "sleep", t: "Sueño", w: 78 },
      { k: "triggers", t: "Posibles factores", w: 175 },
      { k: "routine", t: "Rutina", w: CW - 56 - 70 - 78 - 175 },
    ];
    const rowH = 22;
    ensure(40 + rowH);
    eyebrow("Bitácora semanal", M, y);
    y += 14;

    // cabecera
    setFill(C.navy);
    doc.roundedRect(M, y, CW, rowH, 5, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    setColor(C.white);
    let cx = M + 12;
    cols.forEach((c) => {
      doc.text(c.t, cx, y + 14);
      cx += c.w;
    });
    y += rowH;

    doc.setFontSize(9);
    week.forEach((d, idx) => {
      ensure(rowH + 4);
      if (idx % 2 === 0) {
        setFill(C.creamCard);
        doc.rect(M, y, CW, rowH, "F");
      }
      cx = M + 12;
      cols.forEach((c) => {
        if (c.k === "day") {
          doc.setFont("helvetica", "bold");
          setColor(C.navy);
          doc.text(String(d.day), cx, y + 14);
        } else {
          doc.setFont("helvetica", "normal");
          setColor(d.hasData ? C.navySoft : C.faint);
          let val =
            c.k === "itch"
              ? d.itch != null
                ? `${d.itch}/10`
                : "—"
              : dash(d[c.k]);
          val = doc.splitTextToSize(String(val), c.w - 12)[0] || "—";
          doc.text(val, cx, y + 14);
        }
        cx += c.w;
      });
      setDraw(C.hair);
      doc.setLineWidth(0.5);
      doc.line(M, y + rowH, M + CW, y + rowH);
      y += rowH;
    });
    y += 22;
  }

  // ---------- secciones con viñetas ----------
  function bulletSection(title, items, accentColor) {
    if (!items || !items.length) return;
    ensure(40);
    eyebrow(title, M, y, accentColor);
    y += 16;
    doc.setFontSize(10);
    items.forEach((it) => {
      const lines = doc.splitTextToSize(it, CW - 18);
      ensure(lines.length * 14 + 4);
      // viñeta
      setFill(accentColor);
      doc.roundedRect(M, y - 6, 4, 4, 1, 1, "F");
      setColor(C.navySoft);
      doc.setFont("helvetica", "normal");
      lines.forEach((ln, i) => {
        doc.text(ln, M + 14, y);
        y += 14;
        if (i === 0) doc.setFont("helvetica", "normal");
      });
      y += 4;
    });
    y += 10;
  }

  // ---------- disclaimer ----------
  function disclaimer() {
    const text =
      "PielCalma no diagnostica, no indica tratamientos y no reemplaza al dermatólogo. Este reporte organiza información registrada por la cuidadora para facilitar la conversación con el profesional de salud.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(text, CW - 28);
    const boxH = lines.length * 11 + 20;
    ensure(boxH + 6);
    setFill(C.cream);
    setDraw(C.hair);
    doc.setLineWidth(0.8);
    doc.roundedRect(M, y, CW, boxH, 8, 8, "FD");
    setColor(C.muted);
    lines.forEach((ln, i) => doc.text(ln, M + 14, y + 16 + i * 11));
    y += boxH;
  }

  // ---------- pies con paginación ----------
  function stampFooters() {
    const n = doc.getNumberOfPages();
    for (let p = 1; p <= n; p++) {
      doc.setPage(p);
      setDraw(C.hair);
      doc.setLineWidth(0.6);
      doc.line(M, H - 40, W - M, H - 40);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      setColor(C.faint);
      doc.text("PielCalma · Bitácora de cuidado familiar", M, H - 28);
      doc.text(`Generado el ${fmtNow(generatedAt)}`, W / 2, H - 28, { align: "center" });
      doc.text(`${p} / ${n}`, W - M, H - 28, { align: "right" });
    }
  }

  // ---------- ensamblar ----------
  header();
  patientBar();
  summary();
  kpis();
  chart();
  sleepBars();
  table();
  bulletSection("Posibles patrones observados", patterns, C.accent);
  bulletSection("Preguntas para el dermatólogo", questions, [75, 122, 97]);
  bulletSection("Observaciones visuales", observations, [167, 104, 93]);
  disclaimer();
  stampFooters();

  doc.setProperties({
    title: `PielCalma — Reporte ${profile.childName || ""}`.trim(),
    subject: "Reporte de seguimiento entre consultas",
    author: "PielCalma",
  });

  return doc;
}
