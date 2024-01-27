import { Storage } from "megajs";
import fs from "fs";
import path from "path";
 
const email = "moy_45hdz@outlook.com";
const password = "Moi15se4$1";

const directorio = "./Uploads";
const eliminarFiles = (res) => {
  fs.readdir(directorio, (err, archivos) => {
    if (err) {
      console.error("Error al leer el directorio:", err);
      res.status(500).json({ msg: "Error al eliminar archivos" });
      return;
    }
    archivos.forEach((archivo) => {
      const rutaArchivo = path.join(directorio, archivo);
      fs.unlink(rutaArchivo, (err) => {
        if (err) {
          console.error(`Error al eliminar ${archivo}:`, err);
        } else {
          console.log(`${archivo} eliminado`);
        }
      });
    });
  });
};

const subirFileMega = async (req, res) => {
  try {
    const storage = await new Storage({ email, password }).ready;
    if (req.files.length < 0) {
      res.status(200).json({ msg: "No se encontro archivo" });
      return;
    }
    const fileName = path.basename(req.files[0].path);
    const fileDirecccion = req.files[0].path;
    console.log(fileDirecccion);
    const file = await storage.upload(
      { name: fileName, size: req.files[0].size },
      fs.createReadStream(req.files[0].path)
    ).complete;
    const link = await file.link();
    res.status(200).json(link);
    fs.unlink(fileDirecccion, (error) => {
      if (error) console.log("error al eliminar el archivo", fileName);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Ocurrio un error al subir el archivo" });
    eliminarFiles(res);
  }
};

export default subirFileMega;
