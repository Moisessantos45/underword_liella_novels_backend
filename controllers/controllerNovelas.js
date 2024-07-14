import db_firebase from "../firebase/auth_firebase.js";
import { obtenerFecha, obtenerHora } from "../helpers/Fecha.js";
import envioNotificaciones from "../helpers/notificacionesResend.js";

const obtener_data_doc = async (id) => {
  const data = await db_firebase.collection("Novelas").doc(id).get();
  const datos = data.data();
  datos.id = data.id;
  return datos;
};

const agregarNovela = async (req, res) => {
  const { titulo } = req.body;

  if (!titulo) {
    return res.status(403).json({ msg: "No se enviaron datos" });
  }
  try {
    const { empty } = await db_firebase
      .collection("Volumenes")
      .where("titulo", "==", titulo)
      .limit(1)
      .get();
    if (!empty) return res.status(403).json({ msg: "La novela ya existe" });

    const createdAt = `${obtenerFecha()}-${obtenerHora()}`;

    const { id } = await db_firebase.collection("Novelas").add(req.body);

    await db_firebase.collection("Novelas").doc(id).set(
      {
        id: id,
        createdAt: createdAt,
      },
      { merge: true }
    );

    envioNotificaciones(novelaSave, "addNovel", null);
    res.status(202).json({ msg: "se agrego correctamente" });
  } catch (error) {
    res.status(403).json({ msg: "no se logro agregar" });
  }
};

const obtenerNovelas = async (req, res) => {
  try {
    const { docs } = await db_firebase.collection("Novelas").get();
    const novelas = docs.map((item) => ({ ...item.data(), id: item.id }));
    res.status(202).json(novelas);
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error en la consulta" });
  }
};

const actulizarNovela = async (req, res) => {
  const { id } = req.body;
  try {
    const dataNovel = await db_firebase.collection("Novelas").doc(id).get();
    if (!dataNovel.exists) {
      return res.status(404).json({ msg: "La novela no existe" });
    }
    let novela = dataNovel.data();
    const { id: idReq, ...datos } = req.body;
    for (let prop in datos) {
      if (novela[prop] !== datos[prop]) {
        novela[prop] = datos[prop];
      }
    }

    await db_firebase.collection("Novelas").doc(dataNovel.id).update(novela);
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
  const { id, active } = req.body;

  try {
    const novelaSnapshot = await db_firebase
      .collection("Novelas")
      .where("id", "==", id)
      .limit(1)
      .get();

    if (novelaSnapshot.empty) {
      return res.status(403).json({ msg: "No se encontró la novela" });
    }

    const novelaDoc = novelaSnapshot.docs[0].data();
    const idNovel = novelaSnapshot.docs[0].id;
    await db_firebase
      .collection("Novelas")
      .doc(idNovel)
      .set({ activo: JSON.parse(active) });

    envioNotificaciones(novelaDoc, "inhabilitarNovela", null);

    res.status(202).json({ msg: "Novela inhabilitada correctamente" });
  } catch (error) {
    res.status(500).json({ msg: "Ocurrió un error al inhabilitar la novela" });
  }
};

export {
  agregarNovela,
  obtenerNovelas,
  actulizarNovela,
  eliminarNovela,
  inabilitarNovela,
};
