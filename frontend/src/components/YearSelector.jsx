

export const YearSelector = ({ selectedYear, availableYears, onYearChange }) => {
    return (
        <div className="px-6 pt-6 pb-4 border-b border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Filtrar por año</p>
            <select
                value={selectedYear}
                onChange={onYearChange}
                className="bg-gray-800 border border-gray-700 rounded-lg px-10 py-2 text-gray-100 font-semibold focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition cursor-pointer"
            >
                {availableYears.map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>
        </div>
    );
};