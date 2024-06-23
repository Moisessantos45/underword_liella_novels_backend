import { Router } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);

const router = Router();

const path = dirname(__filename);

const deleteExtencion = (fileName) => {
  return fileName.split(".").shift();
};

const routerDinamicos = async () => {
  const files = fs.readdirSync(path).filter((file) => {
    const fileWithoutExtencion = deleteExtencion(file);
    const verwifyFileNameOmitExtension = ["index"].includes(
      fileWithoutExtencion
    );
    return !verwifyFileNameOmitExtension;
  });

  for (let file of files) {
    const fileWithoutExtencion = deleteExtencion(file);
    const routerPath = `/${fileWithoutExtencion}`;
    const filePath = `./${fileWithoutExtencion}.js`;

    const module = await import(filePath);
    router.use(routerPath, module.default);
  }
};

routerDinamicos();

export default router;
