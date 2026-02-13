export default function DashboardLoading() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                </div>
            ))}
        </div>
    );
}