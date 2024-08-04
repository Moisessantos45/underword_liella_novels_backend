import Jwt from "jsonwebtoken";
import generarJWT from "../helpers/generarJWT.js";
import db_firebase from "../firebase/auth_firebase.js";
import obtener_informacion, { ordenamiento } from "../helpers/obtener_data.js";
import * as funcionesBcrypt from "../helpers/bcryptSalt.js";
import envioNotificaciones from "../helpers/notificacionesResend.js";

// el empty de la consulta de firebase regresa true si no encontro doc
//regresa false si la consulta fue exito es decir encontro el doc

const actualizacionDatos = async (datos, card) => {
  for (let prop in datos) {
    if (card[prop] !== datos[prop]) {
      card[prop] = datos[prop];
    }
  }
  return card;
};

const extraerIlustraciones = (items) => {
  // console.log(items);
  const ilustraciones = [];
  items.forEach((item) => {
    Object.keys(item).forEach((img) => {
      if (
        img == "imagen" ||
        (img == "backgroud" && item[img].startsWith("https://i.ibb.co"))
      ) {
        ilustraciones.push({ imagen: item[img] });
      }
    });
  });
  return ilustraciones;
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email y Password son requeridos" });
  }

  try {
    const userSnapshot = await db_firebase
      .collection("Users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const isPasswordValid = await funcionesBcrypt.verificarPassword(
      password,
      userData.password
    );

    if (!isPasswordValid) {
      return res.status(403).json({ msg: "Password incorrecto" });
    }

    if (!userData.acceso) {
      return res.status(403).json({ msg: "No tienes acceso" });
    }

    const id = userDoc.id;
    if (userData.activo) {
      await db_firebase
        .collection("Users")
        .doc(id)
        .set({ token: null, activo: false }, { merge: true });
    }

    const token = generarJWT(id, "15m");
    const activo = true;

    await db_firebase
      .collection("Users")
      .doc(id)
      .set({ token, activo }, { merge: true });

    const { password: userPassword, ...userWithoutPassword } = userData;
    userWithoutPassword.id = id;
    userWithoutPassword.token = token;
    userWithoutPassword.activo = activo;

    envioNotificaciones(userWithoutPassword, "auth", email);

    res.status(202).json(userWithoutPassword);
  } catch (error) {
    return res.status(500).json({ msg: "Error del servidor" });
  }
};

const panel = async (_req, res) => {
  try {
    const [cardsRef, chapterRef, dataVisitas] = await Promise.all([
      db_firebase.collection("Volumenes").get(),
      db_firebase.collection("Capitulos").get(),
      db_firebase.collection("Visitas").doc("oc37sCt6ELD0UOl07X5T").get(),
    ]);

    let visistas_actuales = dataVisitas.data().visistas;
    const ultimasCard = obtener_informacion(cardsRef).map(
      ({ clave, createdAt, id, nombreClave, volumen }) => ({
        clave,
        createdAt,
        id,
        nombreClave,
        volumen,
      })
    );
    const ultimosCapitulo = obtener_informacion(chapterRef).map(
      ({ titulo, contenido, ...item }) => item
    );

    let ultimasCards = ordenamiento(ultimasCard).slice(0, 10);
    let ultimosCapitulos = ordenamiento(ultimosCapitulo).slice(0, 10);

    res.json({
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
    const { docs } = await db_firebase.collection("Users").get();
    const users = docs.map((item) => ({ ...item.data(), id: item.id }));
    res.status(202).json(users);
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error" });
  }
};

const obtenerIlustraciones = async (req, res) => {
  try {
    const [volumenes, novelas] = await Promise.all([
      db_firebase.collection("Volumenes").get(),
      db_firebase.collection("Novelas").get(),
    ]);
    const volumenesData = volumenes.docs.map((item) => item.data());
    const novelasData = novelas.docs.map((item) => item.data());
    const ilustraciones = [
      ...extraerIlustraciones(volumenesData),
      ...extraerIlustraciones(novelasData),
    ];
    res.json(ilustraciones);
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error" });
  }
};

const addUser = async (req, res) => {
  const { email, password, tipo, id, foto_perfil, name_user } = req.body;
  const token = "";
  const activo = false;
  const acceso = true;
  try {
    const { empty } = await db_firebase
      .collection("Users")
      .where("email", "==", email)
      .get();

    if (!empty) return res.status(403).json({ msg: "El usuario ya existe" });

    const datUser = await db_firebase.collection("Users").doc(id).get();
    const data_user = datUser.data();

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

const extensSession = async (req, res) => {
  const email = req.query.email;

  try {
    const userSnapshot = await db_firebase
      .collection("Users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const id = userSnapshot.docs[0].id;
    const generateToken = generarJWT(id, "20m");

    await db_firebase
      .collection("Users")
      .doc(id)
      .set({ token: generateToken }, { merge: true });
    res.status(202).json(generateToken);
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error" });
  }
};

const solicitarDatosSitioWeb = async (req, res) => {
  try {
    const datosSitioWeb = await db_firebase
      .collection("InicioWebInfo")
      .doc("U9CVBgb0fLi5quLbtARl")
      .get();
    if (!datosSitioWeb.exists)
      return res.status(404).json({ msg: "No se encontro datos" });
    res.status(202).json(datosSitioWeb.data());
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error" });
  }
};

const actualizatDatosSitioWeb = async (req, res) => {
  const { datos } = req.body;
  try {
    const datosSitioWeb = await db_firebase
      .collection("InicioWebInfo")
      .doc("U9CVBgb0fLi5quLbtARl")
      .get();
    if (!datosSitioWeb.exists)
      return res.status(404).json({ msg: "No se encontro datos" });
    const dataSitio = datosSitioWeb.data();
    for (let prop in datos) {
      if (dataSitio[prop] !== datos[prop]) {
        if (prop == "activoReclutamiento") {
          dataSitio[prop] = JSON.parse(datos[prop]);
        }
        dataSitio[prop] = datos[prop];
      }
    }
    await db_firebase
      .collection("InicioWebInfo")
      .doc("U9CVBgb0fLi5quLbtARl")
      .update(dataSitio);
    res.status(202).json(dataSitio);
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error" });
  }
};

const actulizarDatos = async (req, res) => {
  const { email, password, id } = req.body;

  try {
    const datUser = await db_firebase.collection("Users").doc(id).get();
    if (!datUser.exists) {
      return res.status(403).json({ msg: "usuario no encontrado" });
    }
    const { id: _, password: __, ...datos } = req.body;
    const { password: ___, ...dataPersonal } = datUser.data();
    const dataActualizada = actualizacionDatos(datos, dataPersonal);
    if (password.trim() !== "") {
      const salt = await funcionesBcrypt.encryptar(password);
      dataActualizada.password = salt;
    }

    await db_firebase.collection("Users").doc(id).update(dataActualizada);

    envioNotificaciones(dataActualizada, "updatePassword", email);
    res.status(202).json(dataActualizada);
  } catch (error) {
    res.status(404).json({ msg: "Ocurrio un error" });
  }
};

const changeStatusSite = async (req, res) => {
  const status = req.query.status;
  try {
    const validStatus = ["true", "false"].find((item) => item === status);

    if (!validStatus) {
      return res.status(404).json({ msg: "status no valido" });
    }

    const datosSitioWeb = await db_firebase
      .collection("InicioWebInfo")
      .doc("U9CVBgb0fLi5quLbtARl")
      .set({ isMaintenanceMode: JSON.parse(validStatus) }, { merge: true });

    if (!datosSitioWeb.writeTime) {
      return res.status(404).json({ msg: "No se encontro datos" });
    }
    res.status(404).json({ msg: "No se encontro datos" });
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error" });
  }
};

const cerrarSesion = async (req, res) => {
  const { email } = req.body;
  try {
    const datos = await db_firebase
      .collection("Users")
      .where("email", "==", email)
      .get();

    if (datos.empty) {
      return res.status(404).json({ msg: "usuario no encontrado" });
    }

    const id = datos.docs[0].id;
    await db_firebase
      .collection("Users")
      .doc(id)
      .set({ activo: false, token: "" }, { merge: true });
    res.status(202).json({ msg: "se ha cerrado sesion" });
  } catch (error) {
    res.status(404).json({ msg: "Ha ocurrido un error" });
  }
};

const desctivar_user = async (req, res) => {
  const { id, active } = req.body;
  try {
    const user_data = await db_firebase.collection("Users").doc(id).get();
    if (!user_data?.id) {
      return res.status(403).json({ msg: "no se encontro usuario" });
    }
    const user = user_data.data();
    user.acceso = active;
    user.id = user_data.id;
    const email = user.email;

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
  extensSession,
  solicitarDatosSitioWeb,
  actualizatDatosSitioWeb,
  changeStatusSite,
  actulizarDatos,
  desctivar_user,
  cerrarSesion,
  eliminarUsuario,
};
