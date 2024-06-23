import express from "express";
import { obtenerCapitulo, obtenerCapituloNum } from "../controllers/controllerCapitulos.js"

const router= express.Router()

// router.get("/:clave",obtenerCapitulo)
router.get("/:clave/:capitulo", obtenerCapituloNum)

export default router