import React from "react";
import { Link } from "react-router-dom";
import { SearchX, ArrowLeft } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <SearchX size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you are looking for doesn't exist or has been moved. Check the URL or navigate back home.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-500 transition-colors shadow-sm"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
