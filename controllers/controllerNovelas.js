import db_firebase from "../firebase/auth_firebase.js";
import { obtenerFecha, obtenerHora } from "../helpers/Fecha.js";
import obtener_informacion from "../helpers/obtener_data.js";
import envioNotificaciones from "../helpers/notificacionesResend.js";

const obtener_data_doc = async (id) => {
  const data = await db_firebase.collection("Novelas").doc(id).get();
  const datos = data.data();
  datos.id = data.id;
  return datos;
};

const agregarNovela = async (req, res) => {
  const { titulo } = req.body;
  // console.log(req.body)
  if (!titulo) {
    return res.status(403).json({ msg: "No se enviaron datos" });
  }
  const verificar = await db_firebase
    .collection("Volumenes")
    .where("titulo", "==", titulo)
    .get();
  if (!verificar.empty)
    return res.status(403).json({ msg: "La novela ya existe" });
  let clave = titulo.split(" ").slice(0, 3).join("_").toLowerCase();
  const createdAt = `${obtenerFecha()}-${obtenerHora()}`;
  try {
    const novelas_data = await db_firebase
      .collection("Novelas")
      .add({ ...req.body, clave: clave });
    await db_firebase.collection("Novelas").doc(novelas_data.id).set(
      {
        id: novelas_data.id,
        createdAt: createdAt,
      },
      { merge: true }
    );
    const novelaSave = await obtener_data_doc(novelas_data.id);
    envioNotificaciones(novelaSave, "addNovel", null);
    res.status(202).json(novelaSave);
  } catch (error) {
    res.status(403).json({ msg: "no se logro agregar" });
  }
};

const obtenerNovelas = async (req, res) => {
  try {
    const ilusNovelas = await db_firebase.collection("Novelas").get();
    const novelas = obtener_informacion(ilusNovelas);
    res.status(202).json(novelas);
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error en la consulta" });
  }
};

const actulizarNovela = async (req, res) => {
  const { clave } = req.body;
  const data_novel = await db_firebase
    .collection("Novelas")
    .where("clave", "==", clave)
    .get();
  if (data_novel.empty) {
    return res.status(404).json({ msg: "La novela no existe" });
  }
  let novela = data_novel.docs[0].data();
  const datos = req.body;
  for (let prop in datos) {
    if (datos[prop]) {
      novela[prop] = datos[prop];
    }
  }
  try {
    await db_firebase
      .collection("Novelas")
      .doc(data_novel.docs[0].id)
      .update(novela);
    envioNotificaciones(novela, "updateNovel", null);
    res.status(202).json(novela);
  } catch (error) {
    res.status(403).json({ msg: "Hubo un error al actualizar" });
  }
};

const eliminarNovela = async (req, res) => {
  const { id } = req.params;
  try {
    await db_firebase.collection("Novelas").doc(id).delete();
    envioNotificaciones(novela, "deleteNovel", null);
    res.status(202).json({ msg: "se elimino correctamente" });
  } catch (error) {
    res.status(404).json({ msg: "ocurio un error al eliminar" });
  }
};

const inabilitarNovela = async (req, res) => {
  const { clave, active } = req.body;
  const data_novel = await db_firebase
    .collection("Novelas")
    .where("clave", "==", clave)
    .get();
  const novela = obtener_informacion(data_novel);
  if (novela.length < 0) {
    return res.status(403).json({ msg: "no se encontro la novela" });
  }
  novela[0].activo = active;
  try {
    await db_firebase
      .collection("Novelas")
      .doc(novela[0].id)
      .update({ activo: active });
    const novelaActualizada = novela;
    envioNotificaciones(novelaActualizada, "inahilitarNovel", null);
    res.status(202).json(novelaActualizada);
  } catch (error) {
    res.status(404).json({ msg: error });
  }
};

export {
  agregarNovela,
  obtenerNovelas,
  actulizarNovela,
  eliminarNovela,
  inabilitarNovela,
};
