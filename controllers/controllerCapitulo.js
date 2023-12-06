import db_firebase from "../firebase/auth_firebase.js";
import { obtenerFecha, obtenerHora } from "../helpers/Fecha.js";
import obtener_informacion from "../helpers/obtener_data.js";

const agregarCapitulos = async (req, res) => {
    const { nombre } = req.body
    const data_chapters = await db_firebase.collection("Capitulos").add(req.body)
    const chapter = await db_firebase.collection("Capitulos").doc(data_chapters.id).get()
    const novelas = await db_firebase.collection("Novelas").get()
    const filtrar_novela = obtener_informacion(novelas).filter(item => {
        return new RegExp(nombre, 'i').test(item.titulo);
    });
    const createdAt = `${obtenerFecha()}-${obtenerHora()}`
    const capituloSave = chapter.data()
    capituloSave.clave = filtrar_novela[0].clave
    try {
        await db_firebase.collection("Capitulos").doc(chapter.id).set({
            id: data_chapters.id,
            createdAt: createdAt
        }, { merge: true })
        await db_firebase.collection("Capitulos").doc(chapter.id).update({ clave: capituloSave.clave, })
        res.status(202).json(capituloSave)
    } catch (error) {
        res.status(403).json({ msg: "ocurrio un error" })
    }
}

const mostrarCapitulos = async (req, res) => {
    const data_capitulos = await db_firebase.collection("Capitulos").get()
    const capitulos = obtener_informacion(data_capitulos)
    res.status(202).json(capitulos)
}

const actulizarCapitulo = async (req, res) => {
    const { clave, capitulo } = req.body
    const capitulos_data = await db_firebase.collection("Capitulos").where("clave", "==", clave).where("capitulo", "==", capitulo).get()
    if (capitulos_data.empty) {
        return res.status(403).json({ msg: "No se encontro capitulo" })
    }
    const capitulos = capitulos_data.docs[0].data()
    const datos = req.body
    for (let prop in datos) {
        if (datos[prop]) {
            capitulos[prop] = datos[prop];
        }
    }

    try {
        await db_firebase.collection("Capitulos").doc(capitulos_data.docs[0].id).update(capitulos)
        res.status(202).json(capitulos)
    } catch (error) {
        res.status(404).json({ msg: "Ocurrio un error al actulizar" })
    }
}


const eliminarCapitulo = async (req, res) => {
    const { id } = req.params
    try {
        await db_firebase.collection("Capitulos").doc(id).delete()
        res.status(202).json({ msg: "se elimino correctamente" })
    } catch (error) {
        res.status(404).json({ msg: "No se logro eliminar" })
    }
}

export {
    agregarCapitulos,
    mostrarCapitulos,
    actulizarCapitulo,
    eliminarCapitulo
}