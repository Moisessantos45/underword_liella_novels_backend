import express from "express";
import {
  obtenerCapitulo,
  obtenerCapituloNum,
} from "../controllers/controllerCapitulos.js";

const router = express.Router();

router.get("/:idNovel/:capitulo", obtenerCapituloNum);

export default router;
