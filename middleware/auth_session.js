import Jwt from "jsonwebtoken";

const checkAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      Jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          const error = new Error("Token no valido");
          res.status(403).json({ msg: error.message });
        }
        req.query.userId = decoded.id;
        return next();
      });
    } catch (error) {
      const errores = new Error("Token no valido");
      res.status(404).json({ msg: errores.message });
    }
  }
};

export default checkAuth;
