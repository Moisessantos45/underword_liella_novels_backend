import express from "express";
import {
  obtenerNovelasInicio,
  mostrarInfoNovela,
  getCard,
  getRecomendaciones,
} from "../controllers/controllerInicio.js";

const router = express.Router();

router.get("/", obtenerNovelasInicio);
router.get("/novela/:idNovel", mostrarInfoNovela);
router.get("/novela/volumen/:idNovel", getCard);
router.get("/novela/recomendaciones/:idNovel", getRecomendaciones);

export default router;
