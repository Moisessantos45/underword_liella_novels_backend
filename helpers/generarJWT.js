import Jwt from "jsonwebtoken";

const generarJQWT = (id) => {
    return Jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "15d" 
    })
}

export default generarJQWT