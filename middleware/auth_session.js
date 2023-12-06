import db from "../firebase/auth_firebase.js";
import Jwt from "jsonwebtoken";

const checkAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]
      const decoded = Jwt.verify(token, process.env.JWT_SECRET)
      // console.log(decoded)
      const snapshot = await db.collection("Users").where('token', '==', decoded).get();
      return next()
    } catch (error) {
      const errores = new Error("Token no valido")
      res.status(404).json({ msg: errores.message })
    }
  }
  if (!token) {
    const error = new Error("Token inexistente")
    res.status(403).json({ msg: error.message })
  }
  next()
}

export default checkAuth