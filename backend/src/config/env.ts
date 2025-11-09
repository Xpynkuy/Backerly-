import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 5001;
export const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables. Please set it in .env file.");
}

export const JWT_SECRET = jwtSecret; 