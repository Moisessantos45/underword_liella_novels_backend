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
    const novela = await db_firebase.collection('Capitulos').where("clave", "==", clave).where("capitulo", "==", Number(capitulo)).get();
    const primer = novela.docs[0].data?.capitulo == 0
    // console.log(primer)
    if (capitulo > cont) return res.json({ msg: "capitulo inexistente" })
    const capitulos = await db_firebase.collection('Capitulos').where("clave", "==", clave).get();
    const data = obtener_informacion(novela)[0]
    res.status(202).json({ data, cont, primer })
}

export {
    obtenerCapitulo,
    obtenerCapituloNum
}