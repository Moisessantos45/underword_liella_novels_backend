import { desestructurar_fecha } from "./Fecha.js";

const obtener_informacion = (data) => {
    const datos = []
    // console.log(data)
    if (data.empty) return datos
    data.forEach(docs => {
        let docData = docs.data();
        docData.id = docs.id;
        datos.push(docData);
    });
    return datos
}

export default obtener_informacion

const ordernar_datos_fecha = (data) => {
    const datos = data.map(item => desestructurar_fecha(item));
    datos.sort((fecha1, fecha2) => {
        const date1 = new Date(
            `${fecha1.anio}-${fecha1.mes}-${fecha1.dia}T${fecha1.horas}:${fecha1.min}:${fecha1.seg}`
        );
        const date2 = new Date(
            `${fecha2.anio}-${fecha2.mes}-${fecha2.dia}T${fecha2.horas}:${fecha2.min}:${fecha2.seg}`
        );

        return date1 - date2;
    });

    return datos;
};

const ordenamiento = (data) => {
    if (data.length == 1) return data
    for (let i = 0; i < data.length - 1; i++) {
        let pos = i;
        for (let j = i + 1; j < data.length; j++) {
            if (desestructurar_fecha([data[j].createdAt, data[pos].createdAt])) {
                pos = j;
            }
        }
        if (pos !== i) {
            let temp = data[pos];
            data[pos] = data[i];
            data[i] = temp;
        }
    }
    return data;
};

// const ordenamiento = (data) => {
//     return data.sort((a, b) => {
//         const fechaA = desestructurar_fecha(a.createdAt);
//         const fechaB = desestructurar_fecha(b.createdAt);
//         return esFechaMayor(fechaA, fechaB) ? 1 : -1;
//     });
// };

const ordenamientoQuicksort = (data) => {
    if (data.length <= 1) {
        return data;
    }

    const pivot = data[0];
    const menores = [];
    const mayores = [];

    for (let i = 1; i < data.length; i++) {
        if (esFechaMenor(data[i].createdAt, pivot.createdAt)) {
            menores.push(data[i]);
        } else {
            mayores.push(data[i]);
        }
    }

    return [...ordenamientoQuicksort(menores), pivot, ...ordenamientoQuicksort(mayores)];
};


const ordenamientoRapido = (data) => {
    // console.log(data)
    if (data.length <= 1) {
        return data;
    }
    const [pivot, ...rest] = data;

    const menores = rest.filter(item => !desestructurar_fecha(item.createdAt, pivot.createdAt))
    const mayores = rest.filter(item => desestructurar_fecha(item.createdAt, pivot.createdAt));

    return [...ordenamientoRapido(mayores), pivot, ...ordenamientoRapido(menores)];
};

export {
    ordernar_datos_fecha,
    ordenamientoRapido,
    ordenamiento
}