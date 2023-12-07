import db_firebase from "../firebase/auth_firebase.js";
import { obtenerFecha, obtenerHora } from "../helpers/Fecha.js";
import obtener_informacion from "../helpers/obtener_data.js";

const agregarCard = async (req, res) => {
    const { nombreClave, captiuloActive } = req.body
    // console.log(req.body)
    const verificar = await db_firebase.collection("Volumenes").where("nombreClave", "==", nombreClave).get()
    if (verificar.empty) return res.status(403).json({ msg: "El volumen ya existe" })
    const card_data = await db_firebase.collection("Volumenes").add(req.body)
    const cards = await db_firebase.collection('Volumenes').doc(card_data.id).get()
    const data_novel = await db_firebase.collection("Novelas").get();
    const novels = obtener_informacion(data_novel)
    const filtrar_novela = novels.filter(item => {
        return new RegExp(nombreClave, 'i').test(item.titulo);
    });
    const card = cards.data()
    if (!JSON.parse(captiuloActive)) {
        card.capitulo = ""
    }
    card.clave = filtrar_novela[0].clave
    const createdAt = `${obtenerFecha()}-${obtenerHora()}`
    try {
        await db_firebase.collection("Volumenes").doc(cards.id).set({
            id: cards.id,
            createdAt: createdAt
        }, { merge: true })
        await db_firebase.collection('Volumenes').doc(cards.id).update({ clave: filtrar_novela[0].clave })
        const cardSave = card
        console.log(cardSave)
        res.status(202).json(cardSave)
    } catch (error) {
        res.status(403).json({ msg: "ocurrio un erorr" })
    }
}

const obtenerCards = async (req, res) => {
    const cards_data = await db_firebase.collection("Volumenes").get();
    const cards = obtener_informacion(cards_data)
    res.status(202).json(cards)
}

const actulizarCard = async (req, res) => {
    const { clave, volumen } = req.body
    // console.log(clave, volumen)
    const cards = await db_firebase.collection('Volumenes').where("clave", "==", clave).where("volumen", "==", volumen).get()
    if (!card?.id) {
        return res.status(404).json({ msg: "Volumen no encontrado" })
    }
    const card = cards.docs[0].data()
    const datos = req.body
    for (let prop in datos) {
        if (datos[prop]) {
            card[prop] = datos[prop];
        }
    }
    try {
        await db_firebase.collection("Volumenes").doc(cards.docs[0].id).update(card)
        res.status(202).json(card)
    } catch (error) {
        res.status(403).json({ msg: "Hubo un error al actulizar" })
    }
}

const eliminarCard = async (req, res) => {
    const { id } = req.params
    console.log(id)
    try {
        await db_firebase.collection('Volumenes').doc(id).delete()
        res.status(202).json({ msg: "se elimino correctamente" })
    } catch (error) {
        res.status(404).json({ msg: "ocurrio un error al eliminar" })
    }
}

export {
    agregarCard,
    obtenerCards,
    actulizarCard,
    eliminarCard
}