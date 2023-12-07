import db from "../firebase/auth_firebase";

const Cofirmar_existencia =async () => {
    const cards = await db_firebase.collection('Volumenes').where("clave", "==", clave).where("volumen", "==", volumen).get()
}

export default Cofirmar_existencia
