const express = require("express");
const router = express.Router();
const Adhikaram = require("../models/Adhikaram");

// This is a "single source of truth" endpoint: content AND cartoon theme (environment,
// palette, mood, animation) are delivered together so the frontend only renders.

const LIST_FIELDS = {
  _id: 0,
  id: 0,
  intro: 0,
  theme: 0,
  kurals: 0,
  createdAt: 0,
  updatedAt: 0,
  __v: 0,
};

router.get("/adhikarams", async (req, res) => {
  try {
    const docs = await Adhikaram.find({}, LIST_FIELDS).sort({ number: 1 }).lean();
    res.json({
      adhikarams: docs.map((a) => ({
        id: String(a.number),
        number: a.number,
        nameTamil: a.nameTamil,
        nameEn: a.nameEn,
        section: a.section,
        accent: a.accent,
        environment: a.environment,
      })),
    });
  } catch (err) {
    console.error("GET /api/tamil/adhikarams failed:", err);
    res.status(500).json({ error: "adhikaram_list_failed" });
  }
});

router.get("/adhikarams/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "adhikaram_invalid_id" });
    }
    const number = Number(id);

    const docs = await Adhikaram.find({}, {
      _id: 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    }).sort({ number: 1 }).lean();

    const idx = docs.findIndex((a) => a.number === number);
    if (idx === -1) {
      return res.status(404).json({ error: "adhikaram_not_found" });
    }

    const a = docs[idx];
    res.json({
      adhikaram: {
        id: String(a.number),
        number: a.number,
        nameTamil: a.nameTamil,
        nameEn: a.nameEn,
        section: a.section,
        accent: a.accent,
        environment: a.environment,
        intro: a.intro,
        theme: a.theme,
        kurals: a.kurals,
        navigation: {
          previousId: idx > 0 ? String(docs[idx - 1].number) : null,
          nextId: idx < docs.length - 1 ? String(docs[idx + 1].number) : null,
        },
      },
    });
  } catch (err) {
    console.error(`GET /api/tamil/adhikarams/${req.params.id} failed:`, err);
    res.status(500).json({ error: "adhikaram_detail_failed" });
  }
});

module.exports = router;