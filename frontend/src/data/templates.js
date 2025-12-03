export const templates = [
  {
    id: 1,
    nombre: 'Registrar Cliente',
    desc: 'Registrar un solo cliente en el sistema, puede o no incluir cargas de trabajo',
    archivo: 'template-cliente-individual.json',
    datos: {
      operacion: 'CLI_I',
      contenido: {
        id_cuenta: '',
        cliente: '',
        tipo_proyecto: '',
        compromiso: '',
        workloads: [
          {
            fecha_inicio: "DD-MM-YYYY",
            fecha_fin: "DD-MM-YYYY",
            sdm: "",
            status: 'en_progreso | completado | pausado | cancelado',
            responsable_email: "",
          }
        ]
      }
    }
  },
  {
    id: 2,
    nombre: 'Registrar Clientes en Lote',
    desc: 'Registrar 2 o más clientes simultáneamente, cada uno puede incluir cargas de trabajo o no',
    archivo: 'template-clientes-lote.json',
    datos: {
      operacion: 'CLI_L',
      contenido: [
        {
          id_cuenta: "",
          cliente: "",
          tipo_proyecto: "",
          compromiso: "",
          workloads: [
            {
              fecha_inicio: "DD-MM-YYYY",
              fecha_fin: "DD-MM-YYYY",
              sdm: "",
              status: 'en_progreso | completado | pausado | cancelado',
              responsable_email: "",
            }
          ]
        },
        {
          id_cuenta: "",
          cliente: "",
          tipo_proyecto: "",
          compromiso: "",
          workloads: [
            {
              fecha_inicio: "DD-MM-YYYY",
              fecha_fin: "DD-MM-YYYY",
              sdm: "",
              status: 'en_progreso | completado | pausado | cancelado',
              responsable_email: "",
            }
          ]
        }
      ]
    }
  },
  {
    id: 3,
    nombre: 'Registrar carga de trabajo individual',
    desc: 'Agregar una carga de trabajo a un cliente existente',
    archivo: 'template-carga-individual.json',
    datos: {
      operacion: 'WL_I',
      contenido: {
        id_cliente: "",
        fecha_inicio: "DD-MM-YYYY",
        fecha_fin: "DD-MM-YYYY",
        sdm: "",
        status: 'en_progreso | completado | pausado | cancelado',
        responsable_email: "",
      }
    }
  },
  {
    id: 4,
    nombre: 'Registrar cargas de trabajo en lote',
    desc: 'Agregar múltiples cargas de trabajo a uno o varios clientes existentes',
    archivo: 'template-cargas-lote.json',
    datos: {
      operacion: 'WL_L',
      contenido: [
        {
          id_cliente: "",
          fecha_inicio: "DD-MM-YYYY",
          fecha_fin: "DD-MM-YYYY",
          sdm: "",
          status: 'en_progreso | completado | pausado | cancelado',
          responsable_email: "",
        },
        {
          id_cliente: "",
          fecha_inicio: "DD-MM-YYYY",
          fecha_fin: "DD-MM-YYYY",
          sdm: "",
          status: 'en_progreso | completado | pausado | cancelado',
          responsable_email: "",
        }
      ]
    }
  }
];


export const statusColors = {
  'Iniciado': 'from-yellow-500 to-yellow-400',
  'En progreso': 'from-yellow-400 to-yellow-300',
  'Terminado': 'from-green-500 to-green-400',
  'Cancelado': 'from-red-500 to-red-400',
  'Retrasado': 'from-orange-500 to-orange-400',
};

export const statusProgress = {
  'Iniciado': 20,
  'En progreso': 50,
  'Terminado': 100,
  'Cancelado': 0,
  'Retrasado': 35,
};
