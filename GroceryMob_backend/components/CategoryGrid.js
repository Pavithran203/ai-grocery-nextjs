import Link from 'next/link';

export default function CategoryGrid({ categories }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6 pb-6 w-full place-items-center">
      {categories.map((category, index) => (
        <Link
          href={`/products?category=${category.name.toLowerCase()}`}
          key={category._id || category.name || index}
          className="flex flex-col items-center group cursor-pointer w-full text-center"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 group-hover:border-[#1F4A8E] group-hover:shadow-lg transition-all bg-white dark:bg-gray-800 p-1">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="mt-3 text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-[#1F4A8E] transition-colors">
            {category.name}
          </span>
        </Link>
      ))}

      {/* "View All" Circle */}
      <Link href="/products" className="flex flex-col items-center group cursor-pointer w-full text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center group-hover:border-[#1F4A8E] group-hover:bg-blue-50 dark:group-hover:bg-gray-800 transition-all">
          <span className="font-bold text-gray-500 dark:text-gray-400 group-hover:text-[#1F4A8E] text-sm">See All</span>
        </div>
        <span className="mt-3 text-sm font-bold text-transparent select-none">.</span>
      </Link>
    </div>
  );
}
