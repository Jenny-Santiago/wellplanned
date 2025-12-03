import { jsPDF } from 'jspdf';

export const generatePDF = async (client, workloadDistribution, selectedYear, selectedMonth) => {
  try {
    // Obtener datos completos del reporte desde la API
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://asr5khn2e0.execute-api.us-east-2.amazonaws.com/dev/';
    const tipoReporte = selectedMonth ? 'mensual' : 'anual';
    let reporteUrl = `${API_BASE_URL}workloads/report?id_cliente=${client.id_cuenta}&año=${selectedYear}&tipoReporte=${tipoReporte}`;
    
    if (selectedMonth) {
      reporteUrl += `&mes=${selectedMonth}`;
    }

    const response = await fetch(reporteUrl);
    const reporteData = await response.json();
    const reporte = reporteData.data;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    const tipoReporteTexto = selectedMonth ? 'Mensual' : 'Anual';
    
    const img = new Image();
    img.src = '/img.png';
    
    img.onload = () => {
      const margin = 20; // Margen general
      
      // Membrete superior con degradado completamente suave
      const headerHeight = 35;
      
      // Primero llenar todo de negro
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      
      // Luego aplicar degradado solo en la parte izquierda (70% del ancho)
      const gradientWidth = pageWidth * 0.7;
      const steps = 150; // Muchos más pasos para que sea imperceptible
      
      for (let i = 0; i < steps; i++) {
        const x = (gradientWidth / steps) * i;
        const width = (gradientWidth / steps) + 0.5; // +0.5 para evitar gaps
        const ratio = i / steps;
        
        // Degradado suave de morado a negro
        const fadeRatio = Math.pow(ratio, 0.8); // Curva suave
        const r = Math.floor(15 + (0 - 15) * fadeRatio);
        const g = Math.floor(15 + (0 - 15) * fadeRatio);
        const b = Math.floor(35 + (0 - 35) * fadeRatio);
        
        doc.setFillColor(r, g, b);
        doc.rect(x, 0, width, headerHeight, 'F');
      }
      
      // Efecto de estrellas sutiles (solo en la parte morada)
      doc.setFillColor(139, 92, 246, 0.3);
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * (gradientWidth - 20);
        const y = Math.random() * 28;
        const size = Math.random() * 0.4 + 0.2;
        doc.circle(x, y, size, 'F');
      }
      
      // Logo más angosto
      doc.addImage(img, 'PNG', pageWidth - 32, 8, 18, 18);
      
      // Título principal
      doc.setTextColor(168, 85, 247);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('WELLPLANNED', margin, 16);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(196, 181, 253);
      doc.text('Reporte ' + tipoReporteTexto + ' de Workloads', margin, 23);
      
      // Línea decorativa sutil
      doc.setDrawColor(139, 92, 246);
      doc.setLineWidth(0.3);
      doc.line(margin, 30, pageWidth - margin, 30);
      
      // Información del cliente con más padding
      const fecha = new Date();
      const fechaFormateada = fecha.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Cliente:', margin, 45);
      doc.setFont('helvetica', 'normal');
      doc.text(client.cliente, margin + 21, 45);
      
      doc.setFont('helvetica', 'bold');
      doc.text('ID:', margin, 51);
      doc.setFont('helvetica', 'normal');
      doc.text(client.id_cuenta, margin + 21, 51);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Periodo:', margin, 57);
      doc.setFont('helvetica', 'normal');
      const periodoTexto = selectedMonth ? selectedYear + '/' + selectedMonth : selectedYear;
      doc.text(periodoTexto, margin + 21, 57);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Tipo:', margin, 63);
      doc.setFont('helvetica', 'normal');
      doc.text(client.tipo_proyecto, margin + 21, 63);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Fecha:', pageWidth - 70, 45);
      doc.setFont('helvetica', 'normal');
      doc.text(fechaFormateada, pageWidth - 50, 45, { align: 'left' });
      
      // Línea separadora sutil
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, 70, pageWidth - margin, 70);
      
      // Más espacio antes del contenido
      let currentY = 80;
      
      // Título de sección - Resumen
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen de Workloads', margin, currentY);
      currentY += 8;
      
      // Verificar si necesitamos nueva página antes de la tabla
      if (currentY > pageHeight - 100) {
        doc.addPage();
        currentY = 30;
      }
      
      // Tabla de resumen manual
      const total = workloadDistribution.reduce((sum, item) => sum + item.value, 0);
      const tableWidth = pageWidth - (margin * 2);
      const col1Width = tableWidth * 0.5;
      const col2Width = tableWidth * 0.25;
      const col3Width = tableWidth * 0.25;
      const rowHeight = 8;
      
      // Encabezado con morado pastel
      doc.setFillColor(196, 181, 253); // Morado pastel
      doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
      doc.setTextColor(50, 50, 50); // Texto oscuro para mejor contraste
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Estado', margin + 5, currentY + 5.5);
      doc.text('Cantidad', margin + col1Width + (col2Width / 2), currentY + 5.5, { align: 'center' });
      doc.text('Porcentaje', margin + col1Width + col2Width + (col3Width / 2), currentY + 5.5, { align: 'center' });
      
      currentY += rowHeight;
      
      // Filas de datos
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      workloadDistribution.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(252, 252, 253);
          doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
        }
        
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.rect(margin, currentY, tableWidth, rowHeight, 'S');
        
        doc.text(item.name, margin + 5, currentY + 5.5);
        doc.text(String(item.value), margin + col1Width + (col2Width / 2), currentY + 5.5, { align: 'center' });
        const percentage = ((item.value / total) * 100).toFixed(1) + '%';
        doc.text(percentage, margin + col1Width + col2Width + (col3Width / 2), currentY + 5.5, { align: 'center' });
        
        currentY += rowHeight;
      });
      
      // Total sin subrayado
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.1);
      doc.rect(margin, currentY, tableWidth, rowHeight, 'S');
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL', margin + 5, currentY + 5.5);
      doc.text(String(total), margin + col1Width + (col2Width / 2), currentY + 5.5, { align: 'center' });
      doc.text('100%', margin + col1Width + col2Width + (col3Width / 2), currentY + 5.5, { align: 'center' });
      
      currentY += rowHeight + 20;
      
      // Verificar si necesitamos nueva página antes de la gráfica
      if (currentY > pageHeight - 120) {
        doc.addPage();
        currentY = 30;
      }
      
      // Gráfica de pastel
      if (workloadDistribution.length > 0) {
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Distribución Visual', margin, currentY);
        currentY += 12;
        
        // Crear canvas para la gráfica de pastel
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        const centerX = 200;
        const centerY = 200;
        const radius = 120;
        
        const colors = {
          'Completadas': '#6ee7b7', // Verde esmeralda pastel vibrante
          'En Progreso': '#fbbf24', // Amarillo dorado pastel vibrante
          'Canceladas': '#f87171', // Rojo coral pastel vibrante
          'En Pausa': '#a5b4fc' // Azul lavanda pastel vibrante
        };
        
        let startAngle = -Math.PI / 2; // Empezar desde arriba
        
        // Dibujar cada segmento
        workloadDistribution.forEach((item) => {
          const percentage = item.value / total;
          const sliceAngle = percentage * 2 * Math.PI;
          
          // Dibujar segmento
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
          ctx.closePath();
          ctx.fillStyle = colors[item.name] || '#cccccc';
          ctx.fill();
          
          // Borde blanco entre segmentos
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // Texto del porcentaje
          const midAngle = startAngle + sliceAngle / 2;
          const textX = centerX + (radius * 0.6) * Math.cos(midAngle);
          const textY = centerY + (radius * 0.6) * Math.sin(midAngle);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText((percentage * 100).toFixed(0) + '%', textX, textY);
          ctx.shadowBlur = 0;
          
          startAngle += sliceAngle;
        });
        
        // Convertir canvas a imagen y agregar al PDF
        const chartImage = canvas.toDataURL('image/png');
        const chartWidth = 80;
        const chartHeight = 80;
        doc.addImage(chartImage, 'PNG', pageWidth / 2 - chartWidth / 2, currentY, chartWidth, chartHeight);
        
        currentY += chartHeight + 12;
        
        // Leyenda
        const legendStartX = margin + 10;
        let legendX = legendStartX;
        const legendSpacing = 48;
        
        doc.setFontSize(8);
        workloadDistribution.forEach((item, index) => {
          // Cuadrito de color
          const colorHex = colors[item.name] || '#cccccc';
          const r = parseInt(colorHex.slice(1, 3), 16);
          const g = parseInt(colorHex.slice(3, 5), 16);
          const b = parseInt(colorHex.slice(5, 7), 16);
          doc.setFillColor(r, g, b);
          doc.rect(legendX, currentY - 3, 4, 4, 'F');
          
          // Texto
          doc.setTextColor(50, 50, 50);
          doc.setFont('helvetica', 'normal');
          doc.text(item.name + ' (' + item.value + ')', legendX + 6, currentY);
          
          legendX += legendSpacing;
          
          // Nueva línea si es necesario
          if ((index + 1) % 3 === 0 && index < workloadDistribution.length - 1) {
            legendX = legendStartX;
            currentY += 6;
          }
        });
        
        currentY += 20;
      }
      
      // Verificar si necesitamos nueva página antes de la tabla de detalles
      if (currentY > pageHeight - 80) {
        doc.addPage();
        currentY = 30;
      }
      
      // Detalle de Workloads manual
      if (reporte.workloads && reporte.workloads.length > 0) {
        // Título de sección
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Detalle de Workloads (' + reporte.workloads.length + ' total)', margin, currentY);
        currentY += 10;
        
        // Definir anchos de columnas
        const detailTableWidth = pageWidth - (margin * 2);
        const colWidths = [18, 25, 45, 22, 22, 12, 25]; // Total: 169
        const detailRowHeight = 7;
        
        // Encabezado de tabla con morado pastel
        doc.setFillColor(196, 181, 253); // Morado pastel
        doc.rect(margin, currentY, detailTableWidth, detailRowHeight, 'F');
        doc.setTextColor(50, 50, 50); // Texto oscuro
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        
        let xPos = margin;
        const headers = ['ID', 'SDM', 'Responsable', 'Inicio', 'Fin', 'Notificado', 'Status'];
        headers.forEach((header, i) => {
          doc.text(header, xPos + (colWidths[i] / 2), currentY + 5, { align: 'center' });
          xPos += colWidths[i];
        });
        
        currentY += detailRowHeight;
        
        // Filas de datos
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        
        reporte.workloads.forEach((wl, index) => {
          // Verificar si necesitamos nueva página
          if (currentY > pageHeight - 40) {
            // Agregar pie de página
            doc.setDrawColor(139, 92, 246);
            doc.setLineWidth(0.5);
            doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.text('Generado por WellPlanned System', pageWidth / 2, pageHeight - 12, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text('XALDIGITAL', pageWidth / 2, pageHeight - 8, { align: 'center' });
            
            // Nueva página
            doc.addPage();
            currentY = 30;
            
            // Repetir encabezado con morado pastel
            doc.setFillColor(196, 181, 253);
            doc.rect(margin, currentY, detailTableWidth, detailRowHeight, 'F');
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            xPos = margin;
            headers.forEach((header, i) => {
              doc.text(header, xPos + (colWidths[i] / 2), currentY + 5, { align: 'center' });
              xPos += colWidths[i];
            });
            currentY += detailRowHeight;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
          }
          
          // Fondo alternado
          if (index % 2 === 0) {
            doc.setFillColor(252, 252, 253);
            doc.rect(margin, currentY, detailTableWidth, detailRowHeight, 'F');
          }
          
          // Bordes
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.1);
          doc.rect(margin, currentY, detailTableWidth, detailRowHeight, 'S');
          
          // Datos
          xPos = margin;
          doc.setTextColor(50, 50, 50);
          
          // ID
          doc.text((wl.id || '').substring(0, 8), xPos + 2, currentY + 5);
          xPos += colWidths[0];
          
          // SDM
          doc.text((wl.sdm || '').substring(0, 13), xPos + 2, currentY + 5);
          xPos += colWidths[1];
          
          // Responsable
          doc.text((wl.responsable_email || wl.responsable || '').substring(0, 22), xPos + 2, currentY + 5);
          xPos += colWidths[2];
          
          // Inicio
          doc.text(wl.fecha_inicio || '', xPos + (colWidths[3] / 2), currentY + 5, { align: 'center' });
          xPos += colWidths[3];
          
          // Fin
          doc.text(wl.fecha_fin || '', xPos + (colWidths[4] / 2), currentY + 5, { align: 'center' });
          xPos += colWidths[4];
          
          // Notificación con texto en negro
          doc.setTextColor(50, 50, 50);
          doc.setFont('helvetica', 'normal');
          if (wl.notificacion === 'enviada') {
            doc.text('SI', xPos + (colWidths[5] / 2), currentY + 5, { align: 'center' });
          } else {
            doc.text('NO', xPos + (colWidths[5] / 2), currentY + 5, { align: 'center' });
          }
          xPos += colWidths[5];
          
          // Status con texto en negro
          doc.setTextColor(50, 50, 50);
          doc.setFont('helvetica', 'normal');
          doc.text(wl.status || '', xPos + (colWidths[6] / 2), currentY + 5, { align: 'center' });
          
          currentY += detailRowHeight;
        });
      }
      
      // Pie de página en todas las páginas
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        doc.setDrawColor(139, 92, 246);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.text('Generado por WellPlanned System', pageWidth / 2, pageHeight - 12, { align: 'center' });
        doc.setTextColor(0, 0, 0); // Negro
        doc.setFont('helvetica', 'bold');
        doc.text('XALDIGITAL', pageWidth / 2, pageHeight - 8, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(130, 130, 130);
        doc.text(fechaFormateada, pageWidth / 2, pageHeight - 4, { align: 'center' });
      }
      
      // Guardar con nombre del cliente
      const tipoReporteArchivo = selectedMonth ? 'ReporteMensual' : 'ReporteAnual';
      const clienteNombre = client.cliente.replace(/\s+/g, '-');
      const filename = clienteNombre + '-' + tipoReporteArchivo + '.pdf';
      doc.save(filename);
    };
    
    img.onerror = () => {
      alert('Error al cargar el logo. El PDF se generará sin logo.');
    };
    
  } catch (error) {
    alert('Error al generar el PDF: ' + error.message);
  }
};
