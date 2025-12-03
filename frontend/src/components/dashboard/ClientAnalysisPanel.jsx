import { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { generatePDF } from './pdfGenerator';
import { apiService } from '../../services/api';
import { Spinner } from '../Spinner';

export const ClientAnalysisPanel = ({ client }) => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Cargar análisis cuando se selecciona un cliente
  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getClientAnalysis(client.id_cuenta);
        setAnalysisData(data);
        
        // Seleccionar el año más reciente por defecto (ordenar descendente)
        if (data.años && data.años.length > 0) {
          const sortedYears = [...data.años].sort((a, b) => b - a);
          setSelectedYear(sortedYears[0]);
        }
      } catch (error) {
        setAnalysisData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [client.id_cuenta]);

  // Obtener años disponibles desde el análisis
  const availableYears = useMemo(() => {
    if (!analysisData) return [];
    return analysisData.años.sort((a, b) => b - a);
  }, [analysisData]);

  // Obtener meses disponibles del año seleccionado
  const availableMonths = useMemo(() => {
    if (!selectedYear || !analysisData?.resumen_por_año?.[selectedYear]) return [];
    const meses = Object.keys(analysisData.resumen_por_año[selectedYear].meses || {});
    return meses.sort();
  }, [analysisData, selectedYear]);

  // Calcular distribución según filtros
  const workloadDistribution = useMemo(() => {
    if (!analysisData?.resumen_por_año) return [];

    let resumen;
    
    if (selectedYear && selectedMonth) {
      // Filtrar por año y mes específico
      resumen = analysisData.resumen_por_año[selectedYear]?.meses?.[selectedMonth] || {};
    } else if (selectedYear) {
      // Filtrar solo por año (totales del año)
      resumen = analysisData.resumen_por_año[selectedYear] || {};
    } else {
      // Todos los años - sumar todos los totales
      resumen = Object.values(analysisData.resumen_por_año).reduce((acc, año) => ({
        completado: (acc.completado || 0) + (año.completado || 0),
        en_progreso: (acc.en_progreso || 0) + (año.en_progreso || 0),
        cancelado: (acc.cancelado || 0) + (año.cancelado || 0),
        pausado: (acc.pausado || 0) + (año.pausado || 0),
      }), {});
    }

    return [
      { name: 'Completadas', value: resumen.completado || 0, color: '#10b981' },
      { name: 'En Progreso', value: resumen.en_progreso || 0, color: '#f59e0b' },
      { name: 'Canceladas', value: resumen.cancelado || 0, color: '#ef4444' },
      { name: 'En Pausa', value: resumen.pausado || 0, color: '#3b82f6' },
    ].filter(item => item.value > 0);
  }, [analysisData, selectedYear, selectedMonth]);

  const handleGeneratePDF = async () => {
    if (!selectedYear) {
      alert('Por favor selecciona un año para generar el reporte.');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generatePDF(client, workloadDistribution, selectedYear, selectedMonth);
    } catch (error) {
      alert('Error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-900/30 to-gray-900 p-4 border-b border-purple-500/30 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-1">{client.cliente}</h2>
        <p className="text-purple-300 text-xs">{client.id_cuenta}</p>
      </div>

      {/* Filtros mejorados */}
      {!isLoading && analysisData && availableYears.length > 0 && (
        <div className="bg-black/20 backdrop-blur-sm p-4 border-b border-gray-800/50">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-end gap-3">
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">Año</label>
                <select
                  value={selectedYear || ''}
                  onChange={(e) => {
                    setSelectedYear(e.target.value || null);
                    setSelectedMonth(null);
                  }}
                  className="bg-gray-900/80 text-gray-100 border border-purple-500/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:border-purple-500/50"
                >
                  <option value="">Todos</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">Mes</label>
                <select
                  value={selectedMonth || ''}
                  onChange={(e) => setSelectedMonth(e.target.value || null)}
                  disabled={!selectedYear}
                  className="bg-gray-900/80 text-gray-100 border border-purple-500/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:border-purple-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">Todos</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>Mes {month}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleGeneratePDF}
              disabled={!selectedYear}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                selectedYear 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 cursor-pointer' 
                  : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              Descargar Reporte
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 p-4">
        {isLoading ? (
          // Skeleton de carga
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <div className="h-4 bg-gray-700 rounded w-48 mb-3 animate-pulse"></div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-full h-[280px] flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-8 border-gray-700 border-t-purple-500 animate-spin"></div>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-700 animate-pulse"></div>
                    <div className="h-3 bg-gray-700 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !analysisData || availableYears.length === 0 ? (
          // Sin información disponible
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex items-center justify-center h-full">
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400 text-sm">El cliente no cuenta con información disponible</p>
            </div>
          </div>
        ) : (
          // Gráfica con datos
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 h-full">
            <h3 className="text-white text-xs font-medium mb-3">
              Distribución de Workloads
              {selectedYear && ` - ${selectedYear}`}
              {selectedMonth && ` / Mes ${selectedMonth}`}
            </h3>
            <div className="flex flex-col items-center gap-3">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={workloadDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={200}
                    animationBegin={0}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="white" 
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            textShadow: '0 2px 10px rgba(0,0,0,1)',
                            filter: 'drop-shadow(0 0 8px rgba(0,0,0,1))'
                          }}
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    labelLine={false}
                  >
                    {workloadDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke={entry.color}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="flex flex-wrap justify-center gap-4">
                {workloadDistribution.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center gap-1.5">
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-white font-medium text-[10px]">
                      {entry.name}
                    </span>
                    <span className="text-gray-400 text-[10px]">
                      ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spinner de generación de PDF */}
      <Spinner isOpen={isGeneratingPDF} message="Generando reporte PDF..." />
    </div>
  );
};
