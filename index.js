import express from "express";
import dotenv from"dotenv"
import cors from "cors"
import router from "./routes/router_admin.js";
import routerNovels from "./routes/router_novelas.js";
import routerCapitulo from "./routes/router_capitulo.js";
import routerPaginas from "./routes/router_paginas.js";
import routerCapitulos from "./routes/router_capitulos.js";


const app= express()
app.use(express.json())
// dotenv.config()

const dominiosPermitidos = [process.env.FRONTEDN_URL]
const opciones = {
    origin: function (origin, callback) {
        if (dominiosPermitidos.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("No permitido"))
        }
    }
} 

app.use(cors(opciones))

app.use("/api/underword/underwordliellanovels", router)
app.use("/api/underword/novelas", routerNovels) 
app.use("/api/underword/capitulo", routerCapitulo)

app.use("/api/underword/paginas", routerPaginas)
app.use("/api/underword/pagina/capitulo", routerCapitulos)

const PORT= process.env.PORT || 4000

app.listen(PORT,()=>{
    console.log(`Conexion en puerto ${PORT}`)
})