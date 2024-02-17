import SibApiV3Sdk from "@getbrevo/brevo";
import cuerpoHmtl from "./opciones.js";
import dotenv from "dotenv";

dotenv.config();

const types = {
  auth: "Inicio de sesion",
  addUser: "Se ha agregado un nuevo usuario",
  updatePassword: "Se actualizado la contraseña",
  Inhabilitar: "Se ha desactivado una cuenta",
  delete: "Se elimino una cuenta",
  addNovel: "Se agrego una nueva novela",
  updateNovel: "Se actualizo los datos de la novela",
  deleteNovel: "Se elimino una novela",
  inahilitarNovel: "Se dio de baja temporalmente una novela",
  addCard: "Se agrego un volumen",
  updateCard: "Se actualizo los datos de un volumen",
  deleteCard: "Se elimino un volumen",
  addChapter: "Se ha agregado un nuevo capitulo",
  updateChapter: "Se actualizado los datos de un capitulo",
  deleteChapter: "Se elimino un capitulo",
};

const envioNotificaciones = async (content, type, emaill) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  let apiKey = apiInstance.authentications["apiKey"];
  apiKey.apiKey = process.env.EMAIL_KEY;
  const sender = {
    email: "shigatsutranslations@gmail.com",
    name: `Cuenta ${emaill}`,
  };
  try {
    const recivers = [{ email: process.env.EMAIL_PRIVATE, name: emaill }];
    await apiInstance.sendTransacEmail({
      sender,
      to: recivers,
      subject: types[type],
      htmlContent: cuerpoHmtl(content, type),
    });
  } catch (error) {
    console.log(error);
  }
};

export default envioNotificaciones;
