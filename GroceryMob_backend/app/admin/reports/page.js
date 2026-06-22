export default function AdminReports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Reports & Data Analytics</h1>
          <p className="text-sm text-gray-500">Analyze sales performance and export data backups.</p>
        </div>
        <button className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all">Download Report (.csv)</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
           <p className="text-6xl mb-4">📈</p>
           <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Revenue Growth Chart</h3>
           <p className="text-sm text-gray-500 mt-2 text-center max-w-sm">
             (A line chart rendering library like Recharts can be injected here. Currently showing +12% growth over last week)
           </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
           <p className="text-6xl mb-4">🥧</p>
           <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Category Share</h3>
           <p className="text-sm text-gray-500 mt-2 text-center max-w-sm">
             (A pie chart visualizing sales distribution: Vegetables 40%, Dairy 30%, Staples 20%, Fruits 10%)
           </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/50">
        <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-2">📂 Scheduled Data Backups</h3>
        <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
          Data exports and scheduled backups are routed directly to the `database/customer_data/` folder securely.
        </p>
        <button className="bg-blue-600 text-white font-bold text-sm px-5 py-2 rounded-lg hover:bg-blue-700">Trigger Manual Backup</button>
      </div>
    </div>
  );
}
