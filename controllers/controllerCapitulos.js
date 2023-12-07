import db_firebase from "../firebase/auth_firebase.js";
import obtener_informacion from "../helpers/obtener_data.js";

const obtenerCapitulo = async (req, res) => {
    const { clave } = req.params
    const capitulos_data = await db_firebase.collection('Capitulos').where("clave", "==", clave).get();
    const capitulos = obtener_informacion(capitulos_data)
    res.json(capitulos)
}

const obtenerCapituloNum = async (req, res) => {
    const { clave, capitulo } = req.params
    // console.log(clave, capitulo)
    let chapters = await db_firebase.collection('Capitulos').where("clave", "==", clave).get();
    const cont = chapters.docs.length
    const capitulos = await db_firebase.collection('Capitulos').where("clave", "==", clave).where("capitulo", "==", capitulo).get();
    // console.log(primer)
    if (capitulo > cont) return res.json({ msg: "capitulo inexistente" })
    try {
        // const capitulos = await db_firebase.collection('Capitulos').where("clave", "==", clave).get();
        const data = obtener_informacion(capitulos)[0]
        // console.log(data)
        res.status(202).json({ data, cont })
    } catch (error) {
        res.status(404).json({ msg: "No se encontro capitulo" })
    }

}

export {
    obtenerCapitulo,
    obtenerCapituloNum
}