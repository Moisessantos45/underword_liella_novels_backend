import db_firebase from "../firebase/auth_firebase.js";
import obtener_informacion from "../helpers/obtener_data.js";

// const obtener_informacion = (data) => {
//     const datos = []
//     if (data.empty) return datos
//     data.forEach(docs => {
//         let docData = docs.data();
//         docData.id = docs.id;
//         datos.push(docData);
//     });
//     return datos
// }

const busqueda = async (generosArray, clave) => {
    let datos = [];
    let snapshot = await db_firebase.collection("Novelas").where('clave', '!=', clave).get()
    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            let data = doc.data();
            data.id = doc.id;
            datos.push(data);
        });
    }
    const filter_geners = datos.filter(doc => {
        let generosDoc = doc.generos.split(",").map(item => item.trim());
        let cont = 0;
        generosArray.forEach(item => {
            if (generosDoc.includes(item.trim())) {
                cont++;
            }
        });
        return cont >= 2 && cont <= 5
    }).slice(0, 5);
    return filter_geners;
}

const contador_visitas = async () => {
    const visitas = await db_firebase.collection("Visitas").doc("oc37sCt6ELD0UOl07X5T").get()
    let cont = visitas.data().visistas
    cont++
    // console.log(cont)
    await db_firebase.collection("Visitas").doc("oc37sCt6ELD0UOl07X5T").update({ visistas: cont })
    return cont
}

const obtenerNovelasInicio = async (req, res) => {
    try {
        const contactos = await db_firebase.collection('Novelas').get();
        const novela = obtener_informacion(contactos)
        await contador_visitas()
        // console.log(novela)
        res.status(202).json(novela)
    } catch (error) {
        res.status(404).json({ msg: "ocurrio un error de consulta" })
    }
}

const mostrarInfoNovela = async (req, res) => {
    const { clave } = req.params
    // console.log(clave)
    const data_novel = await db_firebase.collection('Novelas').where("clave", "==", clave).get();
    const card_data = await db_firebase.collection('Volumenes').where("clave", "==", clave).get();
    const capi_data = await db_firebase.collection('Capitulos').where("clave", "==", clave).get();
    const info = obtener_informacion(data_novel)[0]
    const card = obtener_informacion(card_data).reverse()
    const capi = obtener_informacion(capi_data)
    const generosSearch = info.generos.split(",")
    try {
        const recomendaciones = await busqueda(generosSearch, clave)
        res.json({ info, card, capi, recomendaciones })
    } catch (error) {
        res.status(404).json({ msg: "ocurrio un error" })
    }

}


export {
    obtenerNovelasInicio,
    mostrarInfoNovela
}