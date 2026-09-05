
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await mongoose.connection.collection('courses').updateMany(
            { level: 'certificate' },
            { $set: { level: 'after12th' } }
        );
        console.log('Updated certificates to after12th:', result.modifiedCount);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
run();
