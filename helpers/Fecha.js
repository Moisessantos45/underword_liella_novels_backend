const obtenerFecha = () => {
    const ahora = new Date();

    const dia = ahora.getDate();
    const mes = ahora.getMonth() + 1;
    const año = ahora.getFullYear();

    return `${dia}-${mes}-${año}`;
};

const obtenerHora = () => {
    const ahora = new Date();
    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    const segundos = ahora.getSeconds();

    return `${horas}-${minutos}-${segundos}`;
};

const esFechaMayor = (fecha1, fecha2) => {
    // console.log(fecha1,fecha2)
    const date1 = new Date(
        `${fecha1.anio}-${fecha1.mes}-${fecha1.dia}T${fecha1.hora}:${fecha1.min}:${fecha1.seg}`
    );
    const date2 = new Date(
        `${fecha2.anio}-${fecha2.mes}-${fecha2.dia}T${fecha2.hora}:${fecha2.min}:${fecha2.seg}`
    );

    return date1 > date2;
};

const desestructurar_fecha = (date) => {
    const fechas_separadas = date.map(item => {
        const fecha = item.split("-")
        return {
            dia: fecha[0],
            mes: fecha[1],
            anio: fecha[2],
            hora: fecha[3],
            min: fecha[4],
            seg: fecha[5]
        }
    })
    return esFechaMayor(fechas_separadas[0], fechas_separadas[1])
}

export {
    obtenerFecha,
    obtenerHora,
    desestructurar_fecha
}