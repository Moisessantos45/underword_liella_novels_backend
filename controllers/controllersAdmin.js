import Jwt from "jsonwebtoken";
import generarJWT from "../helpers/generarJWT.js";
import db_firebase from "../firebase/auth_firebase.js";
import obtener_informacion, { ordenamiento } from "../helpers/obtener_data.js";
import * as funcionesBcrypt from "../helpers/bcryptSalt.js";
import envioNotificaciones from "../helpers/notificacionesResend.js";

// el empty de la consulta de firebase regresa true si no encontro doc
//regresa false si la consulta fue exito es decir encontro el doc

const autenticar = async (req, res) => {
  const { email, password } = req.body;
  const datos = await db_firebase
    .collection("Users")
    .where("email", "==", email)
    .get();
  if (datos.empty) {
    return res.status(404).json({ msg: "usuario no encontrado" });
  }
  const verifyHasPassword = await funcionesBcrypt.verificarPassword(
    password,
    datos.docs[0].data().password
  );
  if (!verifyHasPassword)
    return res.status(403).json({ msg: "Password incorrecto" });
  const id = datos.docs[0].id;
  const habilitado = datos.docs[0].data();
  if (!habilitado.acceso) {
    return res.status(403).json({ msg: "No tienes acceso" });
  }
  let token = generarJWT(id);
  const activo = true;
  try {
    await db_firebase
      .collection("Users")
      .doc(id)
      .set({ token: token, activo: activo }, { merge: true });
    const user = await db_firebase.collection("Users").doc(id).get();
    const usuario_data = user.data();
    usuario_data.id = id;
    const { password, ...usuario } = usuario_data;
    envioNotificaciones(usuario, "auth", email);
    res.status(202).json(usuario);
  } catch (error) {
    await db_firebase
      .collection("Users")
      .doc(id)
      .set({ token: "", activo: false }, { merge: true });
    return res.status(400).json({ msg: error.code || "Usurio no Registrado" });
  }
};

const panel = async (req, res) => {
  const authHeader = req.get("Authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(404).json({ msg: "No se encontro token" });
  const { id } = Jwt.verify(token, process.env.JWT_SECRET);
  try {
    const user = await db_firebase.collection("Users").doc(id).get();
    let usersRef = await db_firebase.collection("Users").get();
    const totalUsuarios = usersRef.docs.length;
    let cardsRef = await db_firebase.collection("Volumenes").get();
    let chapterRef = await db_firebase.collection("Capitulos").get();
    const visitas = await db_firebase
      .collection("Visitas")
      .doc("oc37sCt6ELD0UOl07X5T")
      .get();
    let visistas_actuales = visitas.data().visistas;
    const ultimasCard = obtener_informacion(cardsRef);
    const ultimosCapitulo = obtener_informacion(chapterRef);
    let ultimasCards = ordenamiento(ultimasCard);
    let ultimosCapitulos = ordenamiento(ultimosCapitulo);
    const usuario_data = user.data();
    usuario_data.id = user.id;
    const { password, ...usuario } = usuario_data;
    res.json({
      usuario,
      totalUsuarios,
      ultimosCapitulos,
      ultimasCards,
      visistas_actuales,
    });
  } catch (error) {
    res.status(404).json({ msg: "Ocurrio un error" });
  }
};

const solicitar_users = async (req, res) => {
  try {
    const users_data = await db_firebase.collection("Users").get();
    const users = obtener_informacion(users_data);
    res.status(202).json(users);
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error" });
  }
};

const obtenerIlustraciones = async (req, res) => {
  const ilusNovelas = await InfoNovelas.find({}, "ilustraciones");
  const ilustraciones = ilusNovelas.map((doc) => doc.ilustraciones);
  res.json({ ilustraciones });
};

const addUser = async (req, res) => {
  const { email, password, tipo, id, foto_perfil, name_user } = req.body;
  const token = "";
  const activo = false;
  const acceso = true;
  const verificar = await db_firebase
    .collection("Users")
    .where("email", "==", email)
    .get();
  if (!verificar.empty)
    return res.status(403).json({ msg: "El usuario ya existe" });
  try {
    const user = await db_firebase.collection("Users").doc(id).get();
    const data_user = user.data();
    if (data_user.tipo !== "administrador")
      return res.status(403).json({ msg: "No tienes permisos" });
    const salt = await funcionesBcrypt.encryptar(password);
    await db_firebase.collection("Users").add({
      email,
      password: salt,
      token,
      activo,
      tipo,
      foto_perfil,
      name_user,
      acceso,
    });
    envioNotificaciones(
      { cuenta: data_user.name_user, ...req.body },
      "addUser",
      data_user.email
    );
    res.status(202).json({ msg: "registrado correctamente" });
  } catch (error) {
    res.status(404).json({ msg: "No se ha podido guardar el usario" });
  }
};

const restablecerPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const datos = await db_firebase
      .collection("Users")
      .where("email", "==", email)
      .get();
    if (datos.empty) {
      return res.status(403).json({ msg: "usuario no encontrado" });
    }
    const id = datos.docs[0].id;
    await db_firebase
      .collection("Users")
      .doc(id)
      .set({ token: "", acceso: true, activo: activo }, { merge: true });
    res.status(202).json({ msg: "actualizacion exitosa" });
  } catch (error) {
    res.status(403).json({ msg: "ocurrio un error" });
  }
};

const actulizarPassword = async (req, res) => {
  const { email, password, foto_perfil, name_user, tipo, id } = req.body;
  // console.log(req.body)
  const datos = await db_firebase.collection("Users").doc(id).get();
  if (!datos.exists) {
    return res.status(403).json({ msg: "usuario no encontrado" });
  }
  let datos_actuales = {};
  if (password.trim() === "")
    return res.status(404).json({ msg: "Password vacio" });
  const salt = await funcionesBcrypt.encryptar(password);
  datos_actuales.password = salt;
  if (foto_perfil.trim() !== "") datos_actuales.foto_perfil = foto_perfil;
  if (name_user.trim() !== "") datos_actuales.name_user = name_user;
  if (tipo.trim() !== "") datos_actuales.tipo = tipo;
  if (email.trim() !== "") datos_actuales.email = email;
  try {
    await db_firebase.collection("Users").doc(id).update(datos_actuales);
    const usuario_actualizado = await db_firebase
      .collection("Users")
      .doc(id)
      .get();
    const data_usuario = usuario_actualizado.data();
    const { password, ...datosActualizados } = data_usuario;
    datosActualizados.id = id;
    envioNotificaciones(datosActualizados, "updatePassword", email);
    res.status(202).json(datosActualizados);
  } catch (error) {
    res.status(404).json({ msg: "Ocurrio un error" });
  }
};

const cerrarSesion = async (req, res) => {
  const { email } = req.body;
  const datos = await db_firebase
    .collection("Users")
    .where("email", "==", email)
    .get();
  if (datos.empty) {
    return res.status(404).json({ msg: "usuario no encontrado" });
  }
  const id = datos.docs[0].id;
  try {
    await db_firebase
      .collection("Users")
      .doc(id)
      .update({ activo: false, token: "" });
    res.status(202).json({ msg: "se ha cerrado sesion" });
  } catch (error) {
    res.status(404).json({ msg: "Ha ocurrido un error" });
  }
};

const desctivar_user = async (req, res) => {
  const { id, active } = req.body;
  const user_data = await db_firebase.collection("Users").doc(id).get();
  if (!user_data?.id) {
    return res.status(403).json({ msg: "no se encontro usuario" });
  }
  const user = user_data.data();
  user.acceso = active;
  user.id = user_data.id;
  const email = user.email;
  try {
    await db_firebase
      .collection("Users")
      .doc(user_data.id)
      .update({ acceso: active });
    envioNotificaciones(user, "Inhabilitar", email);
    res.status(202).json(user);
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error" });
  }
};

const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await db_firebase.collection("Users").doc(id).delete();
    envioNotificaciones({ id: id }, "delete", null);
    res.json({ msg: "se elimino correctamente" });
  } catch (error) {
    res.status(404).json({ msg: "ocurio un error al eliminar" });
  }
};

export {
  autenticar,
  panel,
  solicitar_users,
  obtenerIlustraciones,
  addUser,
  restablecerPassword,
  actulizarPassword,
  desctivar_user,
  cerrarSesion,
  eliminarUsuario,
};
