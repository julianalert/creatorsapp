type CategoryBadgeProps = {
  category: string
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const getBadgeClasses = (category: string): string => {
    switch (category) {
      case 'SEO':
        return 'text-xs inline-flex font-medium bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-full text-center px-2.5 py-1'
      case 'Sales':
        return 'text-xs inline-flex font-medium bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-center px-2.5 py-1'
      case 'Content Marketing':
        return 'text-xs inline-flex font-medium bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-center px-2.5 py-1'
      case 'Paid Ads':
        return 'text-xs inline-flex font-medium bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-full text-center px-2.5 py-1'
      case 'Creator Marketing':
        return 'text-xs inline-flex font-medium bg-pink-500/20 text-pink-700 dark:text-pink-400 rounded-full text-center px-2.5 py-1'
      case 'Business/Strategy':
        return 'text-xs inline-flex font-medium bg-sky-500/20 text-sky-700 dark:text-sky-400 rounded-full text-center px-2.5 py-1'
      case 'Miscellaneous':
        return 'text-xs inline-flex font-medium bg-gray-500/20 text-gray-700 dark:text-gray-400 rounded-full text-center px-2.5 py-1'
      default:
        return 'text-xs inline-flex font-medium bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-full text-center px-2.5 py-1'
    }
  }

  return (
    <div className={getBadgeClasses(category)}>
      {category}
    </div>
  )
}

