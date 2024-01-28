const cuerpoHmtl = (data, type) => {
  const opcions = {
    auth: `
      <img width="120" height="120" src=${data.foto_perfil} alt="Foto de perfil"/>
      <h1>Sesion iniciada: ${data.name_user}</h1>
      <h1>Correo cuenta: ${data.email}</h1>
      <h2>Tipo de user: ${data.tipo}</h2>
      `,
    addUser: `
      <h1>Datos del usuario</h1>
      <h2>Cuenta que la crea ${data.cuenta}</h2>
      <h3>Nombre: ${data.name_user}</h3>
      <p>Tipo de usuario: ${data.tipo}</p>
      <p>Email: ${data.email}</p>
      <p>Password: ${data.password}</p>
      `,
    updatePassword: `
      <h1>Datos del usuario actualizado</h1>
      <h3>Nombre: ${data.name_user}</h3>
      <p>Tipo de usuario: ${data.tipo}</p>
      <p>Email: ${data.email}</p>
      <p>Password: ${data.password}</p>
      `,
    Inhabilitar: `
      <h1>Datos del usuario</h1>
      <h3>Nombre: ${data.name_user}</h3>
      <p>Tipo de usuario: ${data.tipo}</p>
      <p>Email: ${data.email}</p>
      `,
    delete: `
      <h1>Se ha eliminado una cuenta</h1>
      <h3>Id: ${data.id}</h3>
      `,
    addNovel: `
    <h1>Datos de la novela</h1>
    <h3>Nombre: ${data.titulo}</h3>
    <p>Tipo de novela: ${data.tipo}</p>
    <p>Encargados: ${data.encargados}</p>
    `,
    updateNovel: `
    <h1>Datos de la novela actualizada</h1>
    <h3>Nombre: ${data.titulo}</h3>
    <p>Volumen: ${data.tipo}</p>
    `,
    deleteNovel: `
    <h1>Se ha eliminado la novela</h1>
    <h3>Id: ${data.id}</h3>
    `,
    inahilitarNovel: `
    <h1>Datos de la novela actualizada</h1>
    <h3>Nombre: ${data.titulo}</h3>
    <p>Volumen: ${data.tipo}</p>
    `,
    addCard: `
    <h1>Datos del volumen</h1>
    <h3>Nombre: ${data.clave}</h3>
    <p>Volumen: ${data.volumen}</p>
    <p>Link de Mediafire: ${data.mediafire || ""}</p>
    <p>Link de Mega: ${data.mega || ""}</p>
    <p>Link de MegaEpub: ${data.megaEpub || ""}</p>
    <p>Link de MediafireEpub: ${data.mediafireEpub || ""}</p>
    `,
    updateCard: `
    <h1>Datos del volumen actualizado</h1>
    <h3>Nombre: ${data.clave}</h3>
    <p>Volumen: ${data.volumen}</p>
    <p>Link de Mediafire: ${data.mediafire || ""}</p>
    <p>Link de Mega: ${data.mega || ""}</p>
    <p>Link de MegaEpub: ${data.megaEpub || ""}</p>
    <p>Link de MediafireEpub: ${data.mediafireEpub || ""}</p>
    `,
    deleteCard: `
    <h1>Se ha eliminado un volumen</h1>
    <h3>Id: ${data.id}</h3>
    `,
    addChapter: `
    <h1>Datos del capitulo</h1>
    <h3>Nombre: ${data.nombre}</h3>
    <h3>Titulo del capitulo: ${data.titulo}</h3>
    <p>Capitulo: ${data.capitulo}</p>
    `,
    updateChapter: `
    <h1>Datos del capitulo actualizado</h1>
    <h3>Nombre: ${data.nombre}</h3>
    <h3>Titulo del capitulo: ${data.titulo}</h3>
    <p>Capitulo: ${data.capitulo}</p>
    `,
    deleteChapter: `
    <h1>Se ha eliminado un capitulo</h1>
    <h3>Id: ${data.id}</h3>
    `,
  };
  return opcions[type];
};

export default cuerpoHmtl;
