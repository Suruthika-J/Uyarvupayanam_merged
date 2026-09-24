const Stream = require("../models/Stream");

const ALLOWED_CATEGORIES = ["science", "commerce", "arts", "diploma", "polytechnic"];
const ALLOWED_SUB_CATEGORIES = [
  "agriculture",
  "textile-design",
  "home-science",
  "food-hospitality",
  "healthcare",
  "commerce-vocational",
  "technical",
  "printing-creative",
];

/**
 * Validate + normalize a stream payload. Returns either
 * { error: "message" } or { value: { ...normPayload } }.
 */
function validateStreamPayload(body, { partial = false } = {}) {
  const value = {};
  const invalid = (msg) => ({ error: msg });

  // category
  if (body.category !== undefined || !partial) {
    if (!ALLOWED_CATEGORIES.includes(body.category)) {
      return invalid("category must be one of science | commerce | arts | diploma | polytechnic");
    }
    value.category = body.category;
  }

  // category + subCategory
  if (body.category !== undefined) {
    if (body.category === "diploma") {
      if (!ALLOWED_SUB_CATEGORIES.includes(body.subCategory)) {
        return invalid("subCategory is required for diploma and must be one of the 8 allowed values");
      }
      value.subCategory = body.subCategory;
    } else {
      value.subCategory = null;
    }
  }

  // order
  if (body.order !== undefined || !partial) {
    const order = Number(body.order);
    if (!Number.isInteger(order) || order < 0) {
      return invalid("order must be a non-negative integer");
    }
    value.order = order;
  }

  // code / groupName
  if (body.code !== undefined || !partial) {
    if (!body.code || !String(body.code).trim()) return invalid("code is required");
    value.code = String(body.code).trim();
  }
  if (body.groupName !== undefined || !partial) {
    if (!body.groupName || !String(body.groupName).trim()) return invalid("groupName is required");
    value.groupName = String(body.groupName).trim();
  }

  // arrays
  const normalizeArray = (arr, label) => {
    const list = Array.isArray(arr) ? arr : [arr];
    const cleaned = list.map((x) => String(x).trim()).filter(Boolean);
    if (cleaned.length < 1) return invalid(`${label} must have at least one item`);
    return { clean: cleaned };
  };
  if (body.subjects !== undefined || !partial) {
    const r = normalizeArray(body.subjects, "subjects");
    if (r.error) return r;
    value.subjects = r.clean;
  }
  if (body.progression !== undefined || !partial) {
    const r = normalizeArray(body.progression, "progression");
    if (r.error) return r;
    value.progression = r.clean;
  }

  // strings
  if (body.bestFor !== undefined || !partial) {
    if (body.bestFor === null || body.bestFor === undefined || !String(body.bestFor).trim()) {
      return invalid("bestFor is required");
    }
    value.bestFor = String(body.bestFor).trim();
  }
  if (body.backgroundTheme !== undefined || !partial) {
    if (!body.backgroundTheme || !String(body.backgroundTheme).trim()) {
      return invalid("backgroundTheme is required");
    }
    value.backgroundTheme = String(body.backgroundTheme).trim();
  }
  if (body.backgroundImageUrl !== undefined) {
    value.backgroundImageUrl = String(body.backgroundImageUrl).trim();
  }
  if (body.isPublished !== undefined) {
    value.isPublished = !!body.isPublished;
  }

  return { value };
}

// ─── PUBLIC ─────────────────────────────────────────────────────────────
const getStreams = async (req, res) => {
  try {
    const filter = { isPublished: true };
    if (req.query.category) {
      if (!ALLOWED_CATEGORIES.includes(req.query.category)) {
        return res.status(400).json({ success: false, error: "Invalid category filter" });
      }
      filter.category = req.query.category;
    }
    if (req.query.subCategory) {
      if (req.query.category !== "diploma") {
        return res.status(400).json({ success: false, error: "subCategory filter requires category=diploma" });
      }
      if (!ALLOWED_SUB_CATEGORIES.includes(req.query.subCategory)) {
        return res.status(400).json({ success: false, error: "Invalid subCategory filter" });
      }
      filter.subCategory = req.query.subCategory;
    }

    const streams = await Stream.find(filter).sort({ order: 1 }).lean();

    // Facets (counts per category + subCategory) power the tabs & chips
    const facetRows = await Stream.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: { category: "$category", subCategory: "$subCategory" },
          count: { $sum: 1 },
        },
      },
    ]);
    const facets = { categories: {}, subCategories: {} };
    facetRows.forEach((f) => {
      const { category, subCategory } = f._id;
      facets.categories[category] = (facets.categories[category] || 0) + f.count;
      if (subCategory) {
        facets.subCategories[subCategory] = (facets.subCategories[subCategory] || 0) + f.count;
      }
    });
    facets.total = streams.length;

    return res.json({ success: true, data: streams, count: streams.length, facets });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── ADMIN ──────────────────────────────────────────────────────────────
const getAllStreams = async (req, res) => {
  try {
    const streams = await Stream.find({}).sort({ order: 1 }).lean();
    return res.json({ success: true, data: streams, count: streams.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const createStream = async (req, res) => {
  try {
    const result = validateStreamPayload(req.body || {});
    if (result.error) return res.status(400).json({ success: false, error: result.error });

    const stream = await Stream.create(result.value);
    return res.status(201).json({ success: true, data: stream });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: "Duplicate group code or order in this category." });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
};

const updateStream = async (req, res) => {
  try {
    const existing = await Stream.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: "Stream not found" });

    const result = validateStreamPayload(req.body || {}, { partial: true });
    if (result.error) return res.status(400).json({ success: false, error: result.error });

    Object.assign(existing, result.value);
    await existing.save();
    return res.json({ success: true, data: existing });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: "Duplicate group code or order in this category." });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
};

const togglePublish = async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);
    if (!stream) return res.status(404).json({ success: false, error: "Stream not found" });
    stream.isPublished = !stream.isPublished;
    await stream.save();
    return res.json({ success: true, data: stream });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const deleteStream = async (req, res) => {
  try {
    const stream = await Stream.findByIdAndDelete(req.params.id);
    if (!stream) return res.status(404).json({ success: false, error: "Stream not found" });
    return res.json({ success: true, data: { _id: req.params.id } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Accepts [{ id, order }] and persists the new order within its group.
const bulkReorder = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) return res.status(400).json({ success: false, error: "items[] is required" });

    for (const item of items) {
      if (!item.id) return res.status(400).json({ success: false, error: "Each item needs an id" });
      const order = Number(item.order);
      if (!Number.isInteger(order) || order < 0) {
        return res.status(400).json({ success: false, error: "order must be a non-negative integer" });
      }
    }

    const bulk = items.map((item) => ({
      updateOne: { filter: { _id: item.id }, update: { $set: { order: Number(item.order) } } },
    }));
    await Stream.bulkWrite(bulk);
    return res.json({ success: true, updated: items.length });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: "Order conflicts with an existing record in this category." });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Bulk-imports an array of stream records (e.g. pasted seed JSON from the
// admin panel). Insert-only by group code: existing records are never
// overwritten, so admin edits are respected.
const bulkImport = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) return res.status(400).json({ success: false, error: "items[] is required" });

    let inserted = 0;
    let skipped = 0;
    const errors = [];

    for (const item of items) {
      const result = validateStreamPayload(item || {});
      if (result.error) {
        skipped += 1;
        errors.push({ code: item?.code || "?", error: result.error });
        continue;
      }
      const exists = await Stream.findOne({ code: result.value.code });
      if (exists) {
        skipped += 1;
        continue;
      }
      try {
        await Stream.create(result.value);
        inserted += 1;
      } catch (err) {
        skipped += 1;
        errors.push({
          code: result.value.code,
          error: err.code === 11000 ? "duplicate code/order" : err.message,
        });
      }
    }

    return res.json({ success: true, inserted, skipped, errors: errors.slice(0, 10) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Handles a single uploaded themed background image. The route uses multer
// (disk storage → uploads/themes/) and records the served URL.
const uploadThemeAsset = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No image uploaded" });
    const url = `/uploads/themes/${req.file.filename}`;
    return res.json({
      success: true,
      data: { url, themeKey: req.body?.themeKey || "", originalName: req.file.originalname },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getStreams,
  getAllStreams,
  createStream,
  updateStream,
  togglePublish,
  deleteStream,
  bulkReorder,
  bulkImport,
  uploadThemeAsset,
  validateStreamPayload,
  ALLOWED_CATEGORIES,
  ALLOWED_SUB_CATEGORIES,
};