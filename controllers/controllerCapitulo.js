import db_firebase from "../firebase/auth_firebase.js";
import { obtenerFecha, obtenerHora } from "../helpers/Fecha.js";
import envioNotificaciones from "../helpers/notificacionesResend.js";

const agregarCapitulos = async (req, res) => {
  const { titulo, capitulo, idNovel } = req.body;
  try {
    const { empty } = await db_firebase
      .collection("Capitulos")
      .where("idNovel", "==", idNovel)
      .where("titulo", "==", titulo)
      .where("capitulo", "==", +capitulo)
      .limit(1)
      .get();

    if (!empty) return res.status(403).json({ msg: "El capitulo ya existe" });
    const { capitulo: _, ...data } = req.body;
    data.capitulo = Number(capitulo);

    const data_chapters = await db_firebase.collection("Capitulos").add(data);

    const createdAt = `${obtenerFecha()}-${obtenerHora()}`;

    await db_firebase.collection("Capitulos").doc(chapter.id).set(
      {
        id: data_chapters.id,
        createdAt: createdAt,
      },
      { merge: true }
    );
    envioNotificaciones(capituloSave, "addChapter", null);
    res.status(202).json({ msg: "se agrego correctamente" });
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
  const { id, ...updatedData } = req.body;
  try {
    const chapterDoc = await db_firebase.collection("Capitulos").doc(id).get();
    if (!chapterDoc.exists) {
      return res.status(403).json({ msg: "No se encontró el capítulo" });
    }
    const chapterData = chapterDoc.data();
    const updatedChapter = { ...chapterData };

    for (const prop in updatedData) {
      if (
        updatedData.hasOwnProperty(prop) &&
        updatedData[prop] !== chapterData[prop]
      ) {
        updatedChapter[prop] =
          prop === "capitulo" ? Number(updatedData[prop]) : updatedData[prop];
      }
    }
    await db_firebase.collection("Capitulos").doc(id).update(updatedChapter);

    envioNotificaciones(updatedChapter, "updateChapter", null);
    res.status(202).json(updatedChapter);
  } catch (error) {
    res.status(500).json({ msg: "Ocurrió un error al actualizar" });
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
