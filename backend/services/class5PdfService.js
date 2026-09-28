const fs = require("fs");
const path = require("path");
const { jsPDF } = require("jspdf");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const ensureDir = (sub) => {
  const dir = path.join(UPLOADS_DIR, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const savePdf = (doc, sub, filename) => {
  const dir = ensureDir(sub);
  const fullPath = path.join(dir, filename);
  fs.writeFileSync(fullPath, doc.output("arraybuffer"));
  return { fullPath, url: `/uploads/${sub}/${filename}` };
};

// ─── Future Map poster (A4 landscape) ─────────────────────────────────────
function generateFutureMapPdf({ studentName, world, worldsExplored = [], skills = {}, date }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  // Background
  doc.setFillColor(14, 58, 95); // navy #0e3a5f
  doc.rect(0, 0, W, H, "F");

  // Decorative stars/dots
  doc.setFillColor(255, 255, 255);
  doc.setFillColor(148, 195, 255);
  for (let i = 0; i < 40; i += 1) {
    doc.circle(Math.random() * W, Math.random() * H, 0.6, "F");
  }

  // Header
  doc.setDrawColor(255, 215, 0);
  doc.setLineWidth(1.4);
  doc.rect(12, 10, W - 24, H - 20, "S");

  doc.setTextColor(255, 215, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("MY FUTURE MAP", W / 2, 30, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text("Hand-drawn dream to real-world career — made by you!", W / 2, 38, { align: "center" });

  // Student info card
  doc.setFillColor(255, 255, 255);
  doc.setFillColor(30, 90, 150);
  doc.roundedRect(20, 46, W - 40, 26, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(`Explorer: ${studentName || "Future Explorer"}`, 28, 57);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(
    `Career World: ${world ? `${world.emoji ? world.emoji + " " : ""}${world.name}` : "Your starting world"}  •  Printed: ${date}`,
    28,
    66
  );

  // Starting world highlight
  const left = 22;
  let top = 84;
  doc.setFontSize(13);
  doc.setTextColor(255, 215, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Your starting world", left, top);
  top += 7;
  doc.setTextColor(240, 248, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const words = String((world && world.description) || "A world full of things to discover about you.").match(/.{1,72}/g) || [];
  words.forEach((line) => {
    if (top > H - 30) return;
    doc.text(line, left, top);
    top += 6.5;
  });

  // Explored worlds
  top += 6;
  doc.setTextColor(255, 215, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Worlds you explored", left, top);
  top += 7;
  doc.setTextColor(240, 248, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  if (worldsExplored && worldsExplored.length) {
    worldsExplored.slice(0, 8).forEach((w) => {
      if (top > H - 22) return;
      doc.text(`• ${w.emoji ? w.emoji + " " : ""}${w.name}`, left + 3, top);
      top += 6.5;
    });
  } else {
    doc.text("•  More worlds waiting to be discovered…", left + 3, top);
    top += 8;
  }

  // Skill bar
  if (top < H - 30) {
    top += 8;
    doc.setTextColor(255, 215, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Your growing strengths", left, top);
    top += 8;
    const axes = ["creativity", "logic", "empathy", "leadership", "focus"];
    const labels = { creativity: "Creativity", logic: "Logic", empathy: "Empathy", leadership: "Leadership", focus: "Focus" };
    axes.forEach((axis) => {
      if (top > H - 18) return;
      const val = Math.max(0, Math.min(100, Number(skills && skills[axis]) || 25));
      doc.setTextColor(240, 248, 255);
      doc.text(labels[axis], left, top);
      doc.setFillColor(50, 110, 160);
      doc.rect(left + 32, top - 3, 60, 3, "F");
      doc.setFillColor(255, 215, 0);
      doc.rect(left + 32, top - 3, 60 * (val / 100), 3, "F");
      top += 7;
    });
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 255);
  doc.text("Uyarvu Payanam · Class 5 · Grow one step every day, at your own pace.", W / 2, H - 12, { align: "center" });

  const filename = `future-map-${Date.now()}.pdf`;
  return savePdf(doc, "future-maps", filename);
}

// ─── Certificate (A4 landscape) ───────────────────────────────────────────
function generateCertificatePdf({ studentName, title, subtitle, kind }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  // Double border
  doc.setDrawColor(14, 58, 95);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, W - 16, H - 16, "S");
  doc.rect(11, 11, W - 22, H - 22, "S");

  doc.setTextColor(14, 58, 95);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text("CERTIFICATE", W / 2, 40, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("awarded to", W / 2, 52, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(14, 58, 95);
  doc.text(studentName || "Future Explorer", W / 2, 70, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(71, 85, 105);
  const main = title || "Certificate of Achievement";
  const lines = String(main).replace(/ [“”"']/g, (m) => m[1]).split(" ");
  const wrapped = doc.splitTextToSize(main, 220);
  doc.text(wrapped, W / 2, 84, { align: "center" });

  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    const sub = doc.splitTextToSize(subtitle, 230);
    doc.text(sub, W / 2, 92, { align: "center" });
  }

  doc.setDrawColor(14, 58, 95);
  doc.setLineWidth(0.5);
  doc.line(60, 150, 120, 150);
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Date", 90, 156, { align: "center" });

  doc.line(180, 150, 240, 150);
  doc.text("Uyarvu Payanam", 210, 156, { align: "center" });

  const stamp = kind === "future-map" ? "🗺️" : "🎖️";
  doc.setFontSize(26);
  doc.text(stamp, W / 2, 175, { align: "center" });

  const filename = `certificate-${kind || "badge"}-${Date.now()}.pdf`;
  return savePdf(doc, "certificates", filename);
}

module.exports = { generateFutureMapPdf, generateCertificatePdf };