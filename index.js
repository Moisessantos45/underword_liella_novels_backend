import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./Routers/index.js";

const app = express();
app.use(express.json());
dotenv.config();

const dominiosPermitidos = [process.env.FRONTEDN_URL];

const opciones = {
  origin: function (origin, callback) {
    if (dominiosPermitidos.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
};

app.use(cors(opciones));

app.use("/api/underword/2.0", router);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Conexion en puerto ${PORT}`);
});
