import express from "express";
import cors from "cors";
import { routes } from "./routes";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173", 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(routes);

export { app };