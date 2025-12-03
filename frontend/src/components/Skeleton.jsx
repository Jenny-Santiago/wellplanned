
export const Skeleton = ({ items }) => {
    return (
        <div className="space-y-4 mb-8">
            {items.map((i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-800 rounded w-24"></div>
                            <div className="h-6 bg-gray-800 rounded w-48"></div>
                        </div>
                        <div className="h-8 w-8 bg-gray-800 rounded"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-800 rounded w-16"></div>
                            <div className="h-4 bg-gray-800 rounded w-32"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-800 rounded w-20"></div>
                            <div className="h-4 bg-gray-800 rounded w-24"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-800 rounded w-16"></div>
                            <div className="h-4 bg-gray-800 rounded w-28"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};