import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import SafeImage from "./SafeImage";

export default function CategoryGrid({ categories }) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const language = i18n.language;

  return (
    <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-3 sm:gap-5">
      {categories.map((cat) => {
        const catName = language === 'ta' && cat.name_ta ? cat.name_ta :
                      language === 'te' && cat.name_te ? cat.name_te :
                      language === 'kn' && cat.name_kn ? cat.name_kn :
                      language === 'ml' && cat.name_ml ? cat.name_ml :
                      language === 'hi' && cat.name_hi ? cat.name_hi :
                      cat.name;
        
        return (
          <button
            key={cat.id}
            onClick={() => router.push(`/products?category=${encodeURIComponent(cat.id)}`)}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            {/* Circle image */}
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-teal-400 shadow-sm group-hover:shadow-xl group-hover:shadow-teal-400/20 group-hover:-translate-y-1.5 transition-all duration-300 relative"
              style={{ background: cat.color || '#F0FFF8' }}
            >
              <SafeImage
                src={cat.image_url}
                alt={catName || 'Category'}
                type="product"
                entityId={cat.id}
                productName={cat.name}
                componentName="CategoryGrid"
                fill
                sizes="(max-width: 768px) 80px, 100px"
                className="mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500"
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }} />
            </div>

            {/* Icon + Name */}
            <div className="text-center">
              <span className="block text-lg leading-none mb-0.5">{cat.icon}</span>
              <span className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-tight">
                {catName}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
