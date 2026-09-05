const AcademicTaxonomy = require("../models/AcademicTaxonomy");
const COLLEGE_FIELDS_DATA = require("../config/collegeFieldsData");

// ── GET All Academic Fields ─────────────────────────────────────────────────
const getFields = async (req, res) => {
  try {
    const list = await AcademicTaxonomy.find({ status: "active" }).select("fieldId fieldName icon description status");
    if (!list || list.length === 0) {
      // Fallback to config if DB hasn't finished seeding
      return res.status(200).json({
        success: true,
        source: "fallback",
        fields: COLLEGE_FIELDS_DATA.map(f => ({
          fieldId: f.id,
          fieldName: f.name,
          icon: f.icon,
          description: f.description
        }))
      });
    }

    res.status(200).json({
      success: true,
      source: "database",
      fields: list.map(item => ({
        fieldId: item.fieldId,
        fieldName: item.fieldName,
        icon: item.icon,
        description: item.description
      }))
    });
  } catch (error) {
    console.error("Get fields taxonomy error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── GET Degrees by Field ────────────────────────────────────────────────────
const getDegreesByField = async (req, res) => {
  try {
    const { fieldId } = req.query;
    const fId = (fieldId || "engineering").toLowerCase();

    const record = await AcademicTaxonomy.findOne({ fieldId: fId, status: "active" });
    if (!record) {
      // Fallback
      const fb = COLLEGE_FIELDS_DATA.find(f => f.id === fId) || COLLEGE_FIELDS_DATA[0];
      return res.status(200).json({
        success: true,
        fieldId: fId,
        degrees: fb.degrees.map(d => (typeof d === "string" ? { id: d.toLowerCase().replace(/[^\w]+/g, "_"), name: d } : d))
      });
    }

    res.status(200).json({
      success: true,
      fieldId: record.fieldId,
      degrees: record.degrees.filter(d => d.status === "active")
    });
  } catch (error) {
    console.error("Get degrees taxonomy error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── GET Domains / Branches by Field ─────────────────────────────────────────
const getDomainsByField = async (req, res) => {
  try {
    const { fieldId } = req.query;
    const fId = (fieldId || "engineering").toLowerCase();

    const record = await AcademicTaxonomy.findOne({ fieldId: fId, status: "active" });
    if (!record) {
      const fb = COLLEGE_FIELDS_DATA.find(f => f.id === fId) || COLLEGE_FIELDS_DATA[0];
      return res.status(200).json({
        success: true,
        fieldId: fId,
        domains: fb.domains
      });
    }

    res.status(200).json({
      success: true,
      fieldId: record.fieldId,
      domains: record.domains.filter(d => d.status === "active")
    });
  } catch (error) {
    console.error("Get domains taxonomy error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── GET Specializations by Domain ───────────────────────────────────────────
const getSpecializationsByDomain = async (req, res) => {
  try {
    const { fieldId, domainName, domainId } = req.query;
    const fId = (fieldId || "engineering").toLowerCase();

    const record = await AcademicTaxonomy.findOne({ fieldId: fId, status: "active" });
    if (record && record.domains) {
      const dom = record.domains.find(
        d => (domainId && d.id === domainId) || (domainName && d.name.toLowerCase() === domainName.toLowerCase())
      );
      if (dom && dom.specializations) {
        return res.status(200).json({
          success: true,
          domainName: dom.name,
          specializations: dom.specializations.filter(s => s.status === "active")
        });
      }
    }

    // Fallback search
    const fb = COLLEGE_FIELDS_DATA.find(f => f.id === fId) || COLLEGE_FIELDS_DATA[0];
    const fbDom = fb.domains.find(d => domainName && d.name.toLowerCase() === domainName.toLowerCase()) || fb.domains[0];

    res.status(200).json({
      success: true,
      domainName: fbDom ? fbDom.name : "",
      specializations: fbDom ? fbDom.specs.map(s => (typeof s === "string" ? { id: s.toLowerCase().replace(/[^\w]+/g, "_"), name: s } : s)) : []
    });
  } catch (error) {
    console.error("Get specializations taxonomy error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── GET Certifications by Field ─────────────────────────────────────────────
const getCertificationsByField = async (req, res) => {
  try {
    const { fieldId } = req.query;
    const fId = (fieldId || "engineering").toLowerCase();

    const record = await AcademicTaxonomy.findOne({ fieldId: fId, status: "active" });
    if (!record) {
      const fb = COLLEGE_FIELDS_DATA.find(f => f.id === fId) || COLLEGE_FIELDS_DATA[0];
      return res.status(200).json({
        success: true,
        fieldId: fId,
        certifications: fb.certifications
      });
    }

    res.status(200).json({
      success: true,
      fieldId: record.fieldId,
      certifications: record.certifications
    });
  } catch (error) {
    console.error("Get certifications taxonomy error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── ADMIN: Add or Update Taxonomy Field / Degree / Domain ───────────────────
const adminAddTaxonomyItem = async (req, res) => {
  try {
    const { fieldId, fieldName, degreeName, domainName, specializationName, certificationName } = req.body;

    if (!fieldId || !fieldName) {
      return res.status(400).json({ success: false, message: "fieldId and fieldName are required" });
    }

    const fId = fieldId.toLowerCase().trim();
    let record = await AcademicTaxonomy.findOne({ fieldId: fId });

    if (!record) {
      record = new AcademicTaxonomy({
        fieldId: fId,
        fieldName,
        degrees: [],
        domains: [],
        certifications: []
      });
    }

    if (degreeName) {
      const degId = degreeName.toLowerCase().replace(/[^\w]+/g, "_");
      if (!record.degrees.some(d => d.name.toLowerCase() === degreeName.toLowerCase())) {
        record.degrees.push({ id: degId, name: degreeName });
      }
    }

    if (domainName) {
      const domId = domainName.toLowerCase().replace(/[^\w]+/g, "_");
      let domObj = record.domains.find(d => d.name.toLowerCase() === domainName.toLowerCase());
      if (!domObj) {
        domObj = { id: domId, name: domainName, specializations: [] };
        record.domains.push(domObj);
        domObj = record.domains[record.domains.length - 1];
      }

      if (specializationName) {
        const specId = specializationName.toLowerCase().replace(/[^\w]+/g, "_");
        if (!domObj.specializations.some(s => s.name.toLowerCase() === specializationName.toLowerCase())) {
          domObj.specializations.push({ id: specId, name: specializationName });
        }
      }
    }

    if (certificationName) {
      if (!record.certifications.includes(certificationName)) {
        record.certifications.push(certificationName);
      }
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: "Academic taxonomy updated successfully by admin",
      record
    });
  } catch (error) {
    console.error("Admin add taxonomy item error:", error);
    res.status(500).json({ success: false, message: "Failed to update taxonomy" });
  }
};

const getAllTaxonomyAdmin = async (req, res) => {
  try {
    const list = await AcademicTaxonomy.find();
    res.status(200).json({
      success: true,
      taxonomy: list
    });
  } catch (error) {
    console.error("Get all taxonomy admin error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch admin taxonomy" });
  }
};

module.exports = {
  getFields,
  getDegreesByField,
  getDomainsByField,
  getSpecializationsByDomain,
  getCertificationsByField,
  adminAddTaxonomyItem,
  getAllTaxonomyAdmin
};
