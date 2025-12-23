import express from "express";
import cors from "cors";
import { routes } from "./routes";
import { errorHandler } from "./shared/middlewares/errorHandler";

const app = express();

app.use(cors({
  origin: [
    /^https:\/\/lavanderia-perfil.*\.vercel\.app$/, 
    "http://localhost:5173", 
    process.env.CORS_ORIGIN
  ].filter((origin): origin is string | RegExp => !!origin),
  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));

app.use(express.json());
app.use(routes);

app.use(errorHandler);

export { app };