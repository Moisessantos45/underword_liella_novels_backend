import Jwt from "jsonwebtoken"
import generarJWT from "../helpers/generarJWT.js"
import db_firebase from "../firebase/auth_firebase.js"
import obtener_informacion, { ordenamientoRapido,ordenamiento } from "../helpers/obtener_data.js";

const autenticar = async (req, res) => {
    const { email, password } = req.body;
    const datos = await db_firebase.collection("Users").where("email", "==", email).where("password", "==", password).get();
    if (datos.empty) {
        return res.status(404).json({ msg: "usuario no encontrado" })
    }
    const id = datos.docs[0].id;
    const habilitado = datos.docs[0].data()
    if (!habilitado.acceso) {
        return res.status(403).json({ msg: "No tienes acceso" })
    }
    let token = generarJWT(id)
    const activo = true
    try {
        await db_firebase.collection("Users").doc(id).set({ token: token, activo: activo}, { merge: true });
        const user = await db_firebase.collection("Users").doc(id).get()
        const usuario_data = user.data();
        usuario_data.id = id;
        const { password, ...usuario } = usuario_data
        // console.log(usuario)
        res.json(usuario)
    } catch (error) {
        return res.status(400).json({ msg: error.code || "Usurio no Registrado" });
    }
}

const panel = async (req, res) => {
    const authHeader = req.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(404).json({ msg: "No se encontro token" })
    const { id } = Jwt.verify(token, process.env.JWT_SECRET)
    try {
        // console.log(id)
        const user = await db_firebase.collection("Users").doc(id).get()
        let usersRef =await db_firebase.collection('Users').get();
        const totalUsuarios = usersRef.docs.length;
        // console.log(totalUsuarios)
        let cardsRef = await db_firebase.collection('Volumenes').get()
        let chapterRef = await db_firebase.collection('Capitulos').get()
        const visitas = await db_firebase.collection("Visitas").doc("oc37sCt6ELD0UOl07X5T").get()
        let visistas_actuales = visitas.data().visistas
        const ultimasCard = obtener_informacion(cardsRef);
        // console.log(ultimasCard) 
        const ultimosCapitulo = obtener_informacion(chapterRef)
        let ultimasCards = ordenamiento(ultimasCard)
        let ultimosCapitulos = ordenamiento(ultimosCapitulo)
        // console.log(ultimosCapitulos,ultimasCards)
        const usuario_data = user.data();
        usuario_data.id = user.id;
        const { password, ...usuario } = usuario_data
        res.json({ usuario, totalUsuarios, ultimosCapitulos, ultimasCards,visistas_actuales })
    } catch (error) {
        res.status(404).json({ msg: "Ocurrio un error" })
    }

}

const solicitar_users = async (req, res) => {
    try {
        const users_data = await db_firebase.collection("Users").get()
        const users = obtener_informacion(users_data)
        res.status(202).json(users)
    } catch (error) {
        res.status(404).json({ msg: "ocurrio un error" })
    }
}

const obtenerIlustraciones = async (req, res) => {
    const ilusNovelas = await InfoNovelas.find({}, 'ilustraciones');
    const ilustraciones = ilusNovelas.map(doc => doc.ilustraciones);
    res.json({ ilustraciones })
}

const addUser = async (req, res) => {
    const { email, password, tipo, id, foto_perfil, name_user } = req.body
    const token = ""
    const activo = false
    const acceso = true
    try {
        const user = await db_firebase.collection("Users").doc(id).get()
        const data_user = user.data()
        if (data_user.tipo !== "administrador") return res.json({ msg: "No tienes permisos" })
        const usuario = await User.collection("Users").add({
            email, password, token, activo, tipo, foto_perfil, name_user, acceso
        })
        res.status(202).json({ msg: "registrado correctamente" })
    } catch (error) {
        res.status(404).json({ msg: "No se ha podido guardar el usario" })
    }
}

const restablecerPassword = async (req, res) => {
    const { email, password } = req.body
    const datos = await db_firebase.collection("Users").where("email", "==", email).get();
    if (datos.empty) {
        return res.json({ msg: "usuario no encontrado" })
    }
    const id = datos.docs[0].id;
    await db_firebase.collection("Users").doc(id).set({ token: token, activo: true, activo: activo }, { merge: true });
    if (!usuario || !respuesta) {
        const error = new Error("email incorrecto")
        return res.status(403).json({ msg: error.message })
    }
    console.log(respuesta)
    res.json({ msg: "actualizacion exitosa" })
}

const actulizarPassword = async (req, res) => {
    const { email, password, foto_perfil, name_user, tipo } = req.body
    const datos = await db_firebase.collection("Users").where("email", "==", email).get();
    if (datos.empty) {
        return res.status(403).json({ msg: "usuario no encontrado" })
    }
    const id = datos.docs[0].id;
    let datos_actuales = {};
    if (password.trim() !== "") datos_actuales.password = password;
    if (foto_perfil.trim() !== "") datos_actuales.foto_perfil = foto_perfil;
    if (name_user.trim() !== "") datos_actuales.name_user = name_user;
    if (tipo.trim() !== "") datos_actuales.tipo = tipo
    if (email.trim() !== "") datos_actuales.email = email
    try {
        await db_firebase.collection("Users").doc(id).update(datos_actuales)
        const usuario_actualizado = await db_firebase.collection("Users").doc(id).get()
        const data_usuario = usuario_actualizado.data()
        const { password, ...datosActualizados } = data_usuario;
        datosActualizados.id = id;
        res.status(202).json(datosActualizados)
    } catch (error) {
        res.status(404).json({ msg: "Ocurrio un error" })
    }
}

const cerrarSesion = async (req, res) => {
    const { email } = req.body
    const datos = await db_firebase.collection("Users").where("email", "==", email).get();
    if (datos.empty) {
        return res.status(404).json({ msg: "usuario no encontrado" })
    }
    const id = datos.docs[0].id
    try {
        await db_firebase.collection("Users").doc(id).update({ activo: false, token: "" })
        res.status(202).json({ msg: "se ha cerrado sesion" })
    } catch (error) {
        res.status(404).json({ msg: "Ha ocurrido un error" })
    }
}

const desctivar_user = async (req, res) => {
    const { id, active } = req.body
    const user_data = await db_firebase.collection("Users").doc(id).get()
    if (!user_data?.id) {
        return res.status(403).json({ msg: "no se encontro usuario" })
    }
    const user = user_data.data()
    user.acceso = active;
    try {
        await db_firebase.collection("Users").doc(user_data.id).update({ acceso: active })
        res.status(202).json(user)
    } catch (error) {
        res.status(404).json({ msg: "ocurrio un error" })
    }
}

const eliminarUsuario = async (req, res) => {
    const { id } = req.params
    try {
        await db_firebase.collection('Users').doc(id).delete()
        res.json({ msg: "se elimino correctamente" })
    } catch (error) {
        res.status(404).json({ msg: "ocurio un error al eliminar" })
    }
}

export {
    autenticar,
    panel,
    solicitar_users,
    obtenerIlustraciones,
    addUser,
    restablecerPassword,
    actulizarPassword,
    desctivar_user,
    cerrarSesion,
    eliminarUsuario
}