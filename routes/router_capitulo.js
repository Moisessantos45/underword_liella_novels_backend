import express from "express"
import { actulizarCapitulo, agregarCapitulos, eliminarCapitulo, mostrarCapitulos } from "../controllers/controllerCapitulo.js"

const router = express.Router()

router.route("/").post(agregarCapitulos).get(mostrarCapitulos).put(actulizarCapitulo)
router.delete("/:id",eliminarCapitulo)

export default router