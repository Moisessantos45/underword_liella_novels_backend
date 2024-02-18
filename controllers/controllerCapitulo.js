import db_firebase from "../firebase/auth_firebase.js";
import { obtenerFecha, obtenerHora } from "../helpers/Fecha.js";
import obtener_informacion from "../helpers/obtener_data.js";
import envioNotificaciones from "../helpers/notificacionesResend.js";

const agregarCapitulos = async (req, res) => {
  const { titulo, capitulo, nombre } = req.body;
  const { empty } = await db_firebase
    .collection("Capitulos")
    .where("titulo", "==", titulo)
    .where("capitulo", "==", +capitulo)
    .get();
  if (!empty) return res.status(403).json({ msg: "El capitulo ya existe" });
  const { capitulo: _, ...data } = req.body;
  data.capitulo = Number(capitulo);
  const data_chapters = await db_firebase.collection("Capitulos").add(data);
  const [chapter, novelas] = await Promise.all([
    db_firebase.collection("Capitulos").doc(data_chapters.id).get(),
    db_firebase.collection("Novelas").get(),
  ]);
  const filtrar_novela = obtener_informacion(novelas).filter((item) => {
    return new RegExp(nombre, "i").test(item.titulo);
  });
  const createdAt = `${obtenerFecha()}-${obtenerHora()}`;
  const capituloSave = chapter.data();
  capituloSave.clave = filtrar_novela[0].clave;
  try {
    await db_firebase.collection("Capitulos").doc(chapter.id).set(
      {
        id: data_chapters.id,
        createdAt: createdAt,
        clave: capituloSave.clave,
      },
      { merge: true }
    );
    envioNotificaciones(capituloSave, "addChapter", null);
    res.status(202).json(capituloSave);
  } catch (error) {
    res.status(403).json({ msg: "ocurrio un error" });
  }
};

const mostrarCapitulos = async (req, res) => {
  try {
    const { docs } = await db_firebase.collection("Capitulos").get();
    const capitulos = docs.map((item) => ({ ...item.data(), id: item.id }));
    res.status(202).json(capitulos);
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error" });
  }
};

const actulizarCapitulo = async (req, res) => {
  const { id } = req.body;
  const dataChapter = await db_firebase.collection("Capitulos").doc(id).get();
  if (!dataChapter.exists) {
    return res.status(403).json({ msg: "No se encontro el capitulo" });
  }
  const capitulos = dataChapter.data();
  const { id: idReq, ...datos } = req.body;
  for (let prop in datos) {
    if (capitulos[prop] !== datos[prop]) {
      if (prop === "capitulo") {
        capitulos[prop] = Number(datos[prop]);
      } else {
        capitulos[prop] = datos[prop];
      }
    }
  }
  try {
    await db_firebase
      .collection("Capitulos")
      .doc(capitulos_data.id)
      .update(capitulos);
    envioNotificaciones(capitulos, "updateChapter", null);
    res.status(202).json(capitulos);
  } catch (error) {
    res.status(404).json({ msg: "Ocurrio un error al actualizar" });
  }
};

const eliminarCapitulo = async (req, res) => {
  const { id } = req.params;
  try {
    await db_firebase.collection("Capitulos").doc(id).delete();
    envioNotificaciones({ id: id }, "deleteChapter", null);
    res.status(202).json({ msg: "se elimino correctamente" });
  } catch (error) {
    res.status(404).json({ msg: "No se logro eliminar" });
  }
};

export {
  agregarCapitulos,
  mostrarCapitulos,
  actulizarCapitulo,
  eliminarCapitulo,
};
