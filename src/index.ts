import app from "./app.js";
import { prisma } from "./config/prisma.js";


const PORT: Number = Number(process.env.PORT) || 1000;

async function startServer() {
    try {
        // await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        console.log("DB connected Successfully ✅");


        app.listen(PORT, () => {
            console.log(`server is running on port: http://localhost:4000`)
        });

    } catch (error) {
        console.log("❌ DB connection Error: ", error);
        process.exit(1);
    }
}

async function shutdownHandler() {
    console.log("🛑 Shutting down...")
    await prisma.$disconnect();
    process.exit(0);
}

process.on("SIGINT", shutdownHandler);
process.on("SIGTERM", shutdownHandler);

startServer()