import bcrypt from "bcrypt"

const encryptar = async (pas) => {
    const salt = await bcrypt.genSalt(10)
    const has = await bcrypt.hash(pas, salt)
    return has
}

const verificarPassword = async (normalPas, hasPass) => {
    return await bcrypt.compare(normalPas, hasPass)
}

export {
    encryptar,
    verificarPassword
}