const mongoose = require("mongoose");

const cutoffSchema = new mongoose.Schema(
    {
        collegeCode: { type: String, required: true },
        collegeName: { type: String, required: true },
        department: { type: String, required: true },
        year: { type: Number, required: true },
        oc: { type: Number, required: true },
        bc: { type: Number, required: true },
        mbc: { type: Number, required: true },
        sc: { type: Number, required: true },
        st: { type: Number, required: true },
        source: { type: String, default: "tnea" },
    },
    { timestamps: true }
);
module.exports = mongoose.model("Cutoff", cutoffSchema);
