export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500">View customers and manage user data across your platform.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between">
           <input type="text" placeholder="Search users by name, email or phone..." className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm w-80 bg-white dark:bg-gray-800 focus:outline-emerald-500" />
           <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold">Export to CSV</button>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4">Customer</th>
              <th className="p-4">Mobile Number</th>
              <th className="p-4">Address</th>
              <th className="p-4">Total Orders</th>
              <th className="p-4">Password</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
             <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
               <td className="p-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">JD</div>
                    <span className="font-bold text-gray-900 dark:text-gray-100">John Doe</span>
                 </div>
                 <p className="text-xs text-gray-500 mt-1 pl-11">john.doe@example.com</p>
               </td>
               <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                 +91 9876543210
               </td>
               <td className="p-4 max-w-xs">
                 <p className="text-gray-800 dark:text-gray-200 truncate" title="No. 12, Park Ave, Mumbai, 400001">No. 12, Park Ave, Mumbai</p>
               </td>
               <td className="p-4 font-bold text-gray-700 dark:text-gray-300">14</td>
               <td className="p-4 text-gray-500 tracking-widest text-lg">••••••••</td>
               <td className="p-4 text-center space-x-2">
                  <button className="text-indigo-600 hover:underline">Edit</button>
                  <button className="text-rose-600 hover:underline font-semibold">Block</button>
               </td>
             </tr>
             <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
               <td className="p-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">JS</div>
                    <span className="font-bold text-gray-900 dark:text-gray-100">Jane Smith</span>
                 </div>
                 <p className="text-xs text-gray-500 mt-1 pl-11">jane.s@example.com</p>
               </td>
               <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                 +91 9876543211
               </td>
               <td className="p-4 max-w-xs">
                 <p className="text-gray-800 dark:text-gray-200 truncate" title="Flat 3B, Sunset Blvd, Delhi, 110001">Flat 3B, Sunset Blvd, Delhi</p>
               </td>
               <td className="p-4 font-bold text-gray-700 dark:text-gray-300">3</td>
               <td className="p-4 text-gray-500 tracking-widest text-lg">••••••••</td>
               <td className="p-4 text-center space-x-2">
                  <button className="text-indigo-600 hover:underline">Edit</button>
                  <button className="text-emerald-600 hover:underline font-semibold">Unblock</button>
               </td>
             </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
