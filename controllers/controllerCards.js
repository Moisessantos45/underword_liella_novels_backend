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
  console.log(req.body);

  try {
    const cardRef = db_firebase.collection("Volumenes").doc(id);
    const cardDoc = await cardRef.get();

    if (!cardDoc.exists) {
      return res.status(404).json({ msg: "Volumen no encontrado" });
    }

    const card = cardDoc.data();
    const { id: idReq, ...datos } = req.body;
    const updates = {};

    for (let prop in datos) {
      if (prop === "links") {
        if (
          !Array.isArray(card.links) ||
          card.links.length !== datos.links.length
        ) {
          updates.links = datos.links;
        } else {
          updates.links = datos.links.map((newLink, index) => {
            const cardLink = card.links[index];
            if (JSON.stringify(cardLink) !== JSON.stringify(newLink)) {
              return newLink;
            }
            return cardLink;
          });
        }
      } else if (JSON.stringify(card[prop]) !== JSON.stringify(datos[prop])) {
        updates[prop] = datos[prop];
      }
    }

    if (Object.keys(updates).length > 0) {
      await cardRef.update(updates);
      const updatedCard = { ...card, ...updates };
      envioNotificaciones(updatedCard, "updateCard", null);
      res.status(200).json(updatedCard);
    } else {
      res.status(200).json({ msg: "No se realizaron cambios" });
    }
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({ msg: "Hubo un error al actualizar" });
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
