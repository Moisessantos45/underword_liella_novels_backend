import db_firebase from "../firebase/auth_firebase.js";
import { obtenerFecha, obtenerHora } from "../helpers/Fecha.js";
import obtener_informacion from "../helpers/obtener_data.js";
import envioNotificaciones from "../helpers/notificacionesResend.js";

const agregarCard = async (req, res) => {
  const { idNovel, volumen } = req.body;
  try {
    await db_firebase.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(
        db_firebase
          .collection("Volumenes")
          .where("idNovel", "==", idNovel)
          .where("volumen", "==", String(volumen))
          .limit(1)
      );

      if (!snapshot.empty) {
        throw new Error("El volumen ya existe");
      }

      const cardData = {
        ...req.body,
        createdAt: `${obtenerFecha()}-${obtenerHora()}`,
      };
      const cardRef = await db_firebase.collection("Volumenes").add(cardData);

      await transaction.set(cardRef, { id: cardRef.id }, { merge: true });
    });

    envioNotificaciones(req.body, "addCard", null);

    res.status(202).json({ msg: "Se agregó correctamente" });
  } catch (error) {
    res.status(403).json({ msg: "Ocurrió un error" });
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
  try {
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
    await db_firebase.collection("Volumenes").doc(cards.id).update(card);
    envioNotificaciones(card, "updateCard", null);
    res.status(202).json(card);
  } catch (error) {
    res.status(403).json({ msg: "Hubo un error al actulizar" });
  }
};

const eliminarCard = async (req, res) => {
  const { id } = req.params;
  try {
    await db_firebase.collection("Volumenes").doc(id).delete();
    envioNotificaciones({ id: id }, "deleteCard", null);
    res.status(202).json({ msg: "se elimino correctamente" });
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error al eliminar" });
  }
};

export { agregarCard, obtenerCards, actulizarCard, eliminarCard };
