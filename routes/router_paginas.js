import express from "express";
import { obtenerNovelasInicio, mostrarInfoNovela } from "../controllers/controllerInicio.js"

const router = express.Router()

router.get("/", obtenerNovelasInicio)
router.get("/novela/:clave", mostrarInfoNovela)

export default router