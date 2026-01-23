const Loading = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-3 h-3 sm:w-4 sm:h-4',
    md: 'w-6 h-6 sm:w-8 sm:h-8',
    lg: 'w-10 h-10 sm:w-12 sm:h-12',
  }

  const spinner = (
    <div className="flex justify-center items-center">
      <div
        className={`${sizes[size]} border-3 sm:border-4 border-primary border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default Loading

