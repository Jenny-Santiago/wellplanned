export const downloadJson = (contenido, nombreArchivo = 'data.json') => {
  // Crear contenido JSON
  const jsonString = JSON.stringify(contenido, null, 2);

  // Crear blob
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Crear URL
  const url = URL.createObjectURL(blob);

  // Crear elemento link
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;

  // Agregar al DOM, click y remover
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Limpiar URL
  URL.revokeObjectURL(url);
};
