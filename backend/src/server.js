require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const scheduler = require("./service/scheduler.service");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            scheduler.start();
        });
    } catch (error) {
        console.error("Error starting server:", error.message);
        process.exit(1);
    }
};

startServer();
