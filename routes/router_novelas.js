import express from "express";
import { actulizarNovela, agregarNovela, inabilitarNovela, eliminarNovela, obtenerNovelas } from "../controllers/controllerNovelas.js";
import { actulizarCard, agregarCard, eliminarCard, obtenerCards } from "../controllers/controllerCards.js";

const router = express.Router()

router.route("/").post(agregarNovela).get(obtenerNovelas).put(actulizarNovela)
router.put("/estado",inabilitarNovela)
router.delete("/:id",eliminarNovela)
// router.put("/ilustraciones",actulizarIlustraciones)
// router.delete("/ilustraciones/:url/:clave",eliminarIlustraciones)
router.route("/cards").post(agregarCard).get(obtenerCards).put(actulizarCard)
router.delete("/cards/:id",eliminarCard)

export default router