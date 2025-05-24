const TaskSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-700/50 p-3 rounded-md shadow-sm mb-2.5 border border-gray-100 dark:border-slate-700 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-3 w-16 bg-gray-200 dark:bg-slate-600 rounded" />
        <div className="h-4 w-12 bg-gray-200 dark:bg-slate-600 rounded" />
      </div>
      
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-600 rounded mt-2.5 mb-2" />
      <div className="h-3 w-full bg-gray-200 dark:bg-slate-600 rounded mb-1" />
      <div className="h-3 w-2/3 bg-gray-200 dark:bg-slate-600 rounded mb-2.5" />
      
      <div className="flex justify-between items-center mt-3">
        <div className="h-6 w-6 bg-gray-200 dark:bg-slate-600 rounded-full" />
        <div className="h-3 w-14 bg-gray-200 dark:bg-slate-600 rounded" />
      </div>
    </div>
  );
};

export default TaskSkeleton;