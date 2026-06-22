export default function AdminOffers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Offers & Promotions</h1>
          <p className="text-sm text-gray-500">Create discount codes, festival offers, and triggers for promotional notifications.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all">+ Create Campaign</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Offers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
           <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">🏷️ Active Coupons</h2>
           <div className="space-y-4">
              <div className="border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 flex justify-between items-center">
                 <div>
                   <p className="font-black text-xl text-indigo-700 dark:text-indigo-400 tracking-wider">DIWALI50</p>
                   <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Flat 50% Off up to ₹200 on Groceries</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-gray-500 font-semibold mb-2">Expires in 3 days</p>
                   <button className="text-xs text-rose-600 font-bold hover:underline">Deactivate</button>
                 </div>
              </div>
              <div className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 flex justify-between items-center">
                 <div>
                   <p className="font-black text-xl text-emerald-700 dark:text-emerald-400 tracking-wider">FREEDEL</p>
                   <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Free Delivery on orders above ₹499</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-emerald-600 font-semibold mb-2">Active</p>
                   <button className="text-xs text-rose-600 font-bold hover:underline">Deactivate</button>
                 </div>
              </div>
           </div>
        </div>

        {/* Campaign Triggers & Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
           <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">🔔 Send Bulk Notification</h2>
           <p className="text-sm text-gray-500 mb-4">Send a push notification or email to all registered users announcing your latest offers.</p>
           
           <div className="space-y-4">
              <input type="text" placeholder="Notification Title (e.g. Flash Sale Alert!)" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900" />
              <textarea placeholder="Message body..." className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 h-24 resize-none" />
              <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-xl shadow-md hover:opacity-90 transition-opacity">
                Send to 2,105 Users
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
