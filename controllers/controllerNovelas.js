import db_firebase from "../firebase/auth_firebase.js"
import { obtenerFecha, obtenerHora } from "../helpers/Fecha.js";
import obtener_informacion from "../helpers/obtener_data.js";

const obtener_data_doc = async (id) => {
    const data = await db_firebase.collection("Novelas").doc(id).get()
    const datos = data.data()
    datos.id = data.id
    return datos
}

const agregarNovela = async (req, res) => {
    const { titulo } = req.body
    // console.log(req.body)
    if (!titulo) {
        return res.status(403).json({ msg: "No se enviaron datos" })
    }
    let clave = `${titulo.split(" ")[0].toLowerCase()}_${titulo.split(" ")[1].toLowerCase()}_${titulo.split(" ")[2].toLowerCase()}`
    const createdAt = `${obtenerFecha}-${obtenerHora}`
    try {
        const novelas_data = await db_firebase.collection("Novelas").add({ ...req.body, clave: clave })
        await db_firebase.collection("Novelas").doc(novelas_data.id).set({
            id: novelas_data.id,
            createdAt: createdAt
        }, { merge: true })
        const novelaSave = await obtener_data_doc(novelas_data.id);
        // console.log(novelaSave)
        res.json(novelaSave)
    } catch (error) {
        res.status(403).json({ msg: "no se puedo agregar" })
    }
}

const obtenerNovelas = async (req, res) => {
    try {
        const ilusNovelas = await db_firebase.collection('Novelas').get();
        const novelas = obtener_informacion(ilusNovelas)
        // console.log(novelas)
        res.status(202).json(novelas)
    } catch (error) {
        res.status(404).json({ msg: "ocurrio un error de consulta" })
    }
}

const actulizarNovela = async (req, res) => {
    const { clave } = req.body;
    const data_novel = await db_firebase.collection('Novelas').where("clave", "==", clave).get();
    if (data_novel.empty) {
        return res.status(404).json({ msg: "La novela no existe" });
    }
    let novela = data_novel.docs[0].data();
    const datos = req.body
    for (let prop in datos) {
        if (datos[prop]) {
            novela[prop] = datos[prop];
        }
    }
    try {
        await db_firebase.collection("Novelas").doc(data_novel.docs[0].id).update(novela);
        res.json(novela);
    } catch (error) {
        res.status(403).json({ msg: "Hubo un error al actualizar" });
    }
}

const eliminarNovela = async (req, res) => {
    const { id } = req.params
    try {
        await db_firebase.collection('Novelas').doc(id).delete()
        res.json({ msg: "se elimino correctamente" })
    } catch (error) {
        res.status(404).json({ msg: "ocurio un error al eliminar" })
    }
}


const cambiarEstado = async (req, res) => {
    const { clave, active } = req.body
    const data_novel = await db_firebase.collection('Novelas').where("clave", "==", clave).get();
    const novela = obtener_informacion(data_novel)
    if (novela.length < 0) {
        return res.status(403).json({ msg: "no se encontro novela" })
    }
    novela[0].activo = active;
    try {
        await db_firebase.collection("Novelas").doc(novela[0].id).update({ activo: active })
        const novelaActualizada = novela
        res.status(202).json(novelaActualizada)
    } catch (error) {
        res.status(404).json({ msg: error })
    }
}

export {
    agregarNovela,
    obtenerNovelas,
    actulizarNovela,
    eliminarNovela,
    cambiarEstado
}