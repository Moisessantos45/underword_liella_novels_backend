import Jwt from "jsonwebtoken";

const generarJQWT = (id,time) => {
    return Jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: time,
        algorithm: "HS256"
    })
}

export default generarJQWT