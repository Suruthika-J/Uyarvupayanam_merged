const mongoose = require("mongoose");

const tneaCutoffSchema = new mongoose.Schema(
    {
        college_name: { type: String, required: true },
        college_code: { type: String, required: true },
        department: { type: String, required: true },
        oc_cutoff: { type: Number, required: true },
        bc_cutoff: { type: Number, required: true },
        mbc_cutoff: { type: Number, required: true },
        sc_cutoff: { type: Number, required: true },
        st_cutoff: { type: Number, required: true },
        year: { type: Number, required: true },
        course_category: { type: String, default: "Engineering" },
    },
    { timestamps: true }
);

// Indexes for fast searching
tneaCutoffSchema.index({ college_name: 'text', department: 'text', college_code: 'text' });
tneaCutoffSchema.index({ year: 1, course_category: 1 });
tneaCutoffSchema.index({ oc_cutoff: -1, bc_cutoff: -1, mbc_cutoff: -1, sc_cutoff: -1, st_cutoff: -1 });

module.exports = mongoose.model("TneaCutoff", tneaCutoffSchema);
