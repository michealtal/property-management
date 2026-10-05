import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/database.js";
import  authRoutes  from "./routes/users/authRoutes.mjs";
import apartmentRoutes from "./routes/apartment/apartmentRoutes.mjs";
import tenantRoutes from "./routes/tenants/tenantRoutes.mjs"

const app = express();
dotenv.config({ path: ".env" });
const port = process.env.PORT || 8000;

app.use(express.json());

connectDB();

app.use("/uploads", express.static('uploads'))
app.use("/api/users", authRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/tenants", tenantRoutes)

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});