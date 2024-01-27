import express from "express";
import {
  obtenerNovelasInicio,
  mostrarInfoNovela,
  getCard,
  getRecomendaciones,
} from "../controllers/controllerInicio.js";

const router = express.Router();

router.get("/", obtenerNovelasInicio);
router.get("/novela/:clave", mostrarInfoNovela);
router.get("/novela/volumen/:clave", getCard);
router.get("/novela/recomendaciones/:clave", getRecomendaciones);

export default router;
