import express from "express";
import {
  actulizarDatos,
  addUser,
  autenticar,
  cerrarSesion,
  desctivar_user,
  eliminarUsuario,
  panel,
  restablecerPassword,
  solicitar_users,
  obtenerIlustraciones,
} from "../controllers/controllersAdmin.js";
import checkAuth from "../middleware/auth_session.js";

const router = express.Router();

router.post("/login", autenticar);
router.post("/agregar-users", checkAuth, addUser);

router.get("/panel-administracion", checkAuth, panel);
router.get("/panel-administracion/colaboradores", checkAuth, solicitar_users);
router.put("/actulizar-datos", actulizarDatos);
router.post("/olvide-password", restablecerPassword);
router.put("/desctivar-user", desctivar_user);
router.delete("/eliminar-user/:id", eliminarUsuario);
router.get("/solicitud_ilustraciones", obtenerIlustraciones);
router.post("/logout", cerrarSesion);

export default router;
