/**
 * Gates acceptance-test HTTP seams (e.g. `/college-advisor/test-profiles`,
 * `/study-tools/planner/test`) behind an explicit environment flag so they are
 * unreachable in normal/local deployments and can never expose or mutate real
 * data by accident.
 *
 * Enable only for verification runs:
 *   ENABLE_TEST_ENDPOINTS=true
 */
const requireTestFlag = (req, res, next) => {
  if (process.env.ENABLE_TEST_ENDPOINTS !== "true") {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  next();
};

module.exports = requireTestFlag;