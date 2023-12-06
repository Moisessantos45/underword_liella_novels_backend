import express from "express";
import { actulizarPassword, addUser, autenticar, cerrarSesion, desctivar_user, eliminarUsuario, panel, restablecerPassword, solicitar_users } from "../controllers/controllersAdmin.js";
import checkAuth from "../middleware/auth_session.js";

const router = express.Router()

router.post("/login", autenticar)
router.post("/agregar-users", checkAuth, addUser);

router.get("/panel-administracion", checkAuth, panel)
router.get("/panel-administracion/colaboradores",checkAuth, solicitar_users)
router.post("/olvide-password", restablecerPassword)
router.post("/logout", cerrarSesion)
router.delete("/eliminar-user/:id", eliminarUsuario)
router.put("/desctivar-user",desctivar_user)
router.put("/actulizar-datos", actulizarPassword)

export default router