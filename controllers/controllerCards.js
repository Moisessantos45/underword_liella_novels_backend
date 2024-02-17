import db_firebase from "../firebase/auth_firebase.js";
import { obtenerFecha, obtenerHora } from "../helpers/Fecha.js";
import obtener_informacion from "../helpers/obtener_data.js";
import envioNotificaciones from "../helpers/notificacionesResend.js";

const agregarCard = async (req, res) => {
  const { nombreClave, captiuloActive, volumen } = req.body;
  const { empty } = await db_firebase
    .collection("Volumenes")
    .where("nombreClave", "==", nombreClave)
    .where("volumen", "==", String(volumen))
    .get();
  if (!empty) return res.status(403).json({ msg: "El volumen ya existe" });
  const card_data = await db_firebase.collection("Volumenes").add(req.body);
  const cards = await db_firebase
    .collection("Volumenes")
    .doc(card_data.id)
    .get();
  const data_novel = await db_firebase.collection("Novelas").get();
  const novels = obtener_informacion(data_novel);
  const filtrar_novela = novels.filter((item) => {
    return new RegExp(nombreClave, "i").test(item.titulo);
  });
  const card = cards.data();
  if (!JSON.parse(captiuloActive)) {
    card.capitulo = "";
  }
  card.clave = filtrar_novela[0].clave;
  const createdAt = `${obtenerFecha()}-${obtenerHora()}`;
  try {
    await db_firebase.collection("Volumenes").doc(cards.id).set(
      {
        id: cards.id,
        createdAt: createdAt,
        clave: filtrar_novela[0].clave,
      },
      { merge: true }
    );
    const cardSave = card;
    envioNotificaciones(req.body, "addCard", null);
    res.status(202).json(cardSave);
  } catch (error) {
    res.status(403).json({ msg: "ocurrio un erorr" });
  }
};

const obtenerCards = async (req, res) => {
  try {
    const cards_data = await db_firebase.collection("Volumenes").get();
    const cards = obtener_informacion(cards_data);
    res.status(202).json(cards);
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error" });
  }
};

const actulizarCard = async (req, res) => {
  const { id } = req.body;
  const cards = await db_firebase.collection("Volumenes").doc(id).get();
  if (!cards.exists) {
    return res.status(404).json({ msg: "Volumen no encontrado" });
  }
  const card = cards.data();
  const { id: idReq, ...datos } = req.body;
  for (let prop in datos) {
    if (card[prop] !== datos[prop]) {
      card[prop] = datos[prop];
    }
  }
  try {
    await db_firebase.collection("Volumenes").doc(cards.id).update(card);
    envioNotificaciones(card, "updateCard", null);
    // console.log(card);
    res.status(202).json(card);
  } catch (error) {
    res.status(403).json({ msg: "Hubo un error al actulizar" });
  }
};

const eliminarCard = async (req, res) => {
  const { id } = req.params;
  // console.log(id)
  try {
    await db_firebase.collection("Volumenes").doc(id).delete();
    envioNotificaciones({ id: id }, "deleteCard", null);
    res.status(202).json({ msg: "se elimino correctamente" });
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error al eliminar" });
  }
};

export { agregarCard, obtenerCards, actulizarCard, eliminarCard };
