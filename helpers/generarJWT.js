import Jwt from "jsonwebtoken";

const generarJQWT = (id) => {
    return Jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "16m" 
    })
}

export default generarJQWT