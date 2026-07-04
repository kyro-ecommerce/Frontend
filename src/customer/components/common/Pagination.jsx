import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

function Pagination({ currentPage, totalPages = 10, onPageChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // If currentPage is passed as prop, use it directly (for callback-based pagination)
  // Otherwise, extract from URL (for URL-based pagination)
  const getCurrentPage = () => {
    if (currentPage !== undefined) {
      return Math.max(1, Math.min(currentPage, totalPages));
    }
    
    // Fallback to URL-based extraction
    const searchParams = new URLSearchParams(location.search);
    const pageFromQuery = parseInt(searchParams.get('page'), 10);
    if (!isNaN(pageFromQuery)) {
      return Math.max(1, Math.min(pageFromQuery, totalPages));
    }
    
    // Extract from path as last resort
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    const pageFromPath = parseInt(lastSegment, 10);
    return isNaN(pageFromPath) ? 1 : Math.max(1, Math.min(pageFromPath, totalPages));
  };

  const activePage = getCurrentPage();
  
  // Generate page URL with query parameters
  const getPageUrl = (page) => {
    const params = new URLSearchParams(location.search);
    params.set('page', page.toString());
    return `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  };
  
  // Define which page numbers to show
  const getVisiblePages = () => {
    let pages = [];
    
    if (totalPages <= 7) {
      // If we have 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (activePage <= 4) {
        // Show first 5 pages + ellipsis + last page
        pages = [1, 2, 3, 4, 5, "ellipsis", totalPages];
      } else if (activePage >= totalPages - 3) {
        // Show first page + ellipsis + last 5 pages
        pages = [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        // Show first + ellipsis + current-1, current, current+1 + ellipsis + last
        pages = [1, "ellipsis", activePage - 1, activePage, activePage + 1, "ellipsis", totalPages];
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  const handleNavigate = (e, page) => {
    e.preventDefault();
    
    // If onPageChange callback is provided, use it (for controlled pagination)
    if (onPageChange && typeof onPageChange === 'function') {
      onPageChange(page);
    } else {
      // Otherwise, navigate using URL (for URL-based pagination)
      navigate(getPageUrl(page));
    }
  };

  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      role="navigation"
      aria-label="pagination"
      className="flex justify-center items-center my-5 w-full"
    >
      <ul className="flex flex-row gap-2 items-center p-0 m-0">
        {/* Previous button */}
        <li>
          <button
            className={`flex gap-1 items-center px-3 py-2 text-sm font-medium no-underline bg-transparent rounded-md border border-transparent border-solid transition-all ${
              activePage <= 1 
                ? "text-zinc-300 cursor-not-allowed" 
                : "text-zinc-500 hover:text-zinc-700 cursor-pointer"
            } duration-200`}
            disabled={activePage <= 1}
            aria-label="Go to previous page"
            onClick={(e) => {
              if (activePage > 1) {
                handleNavigate(e, activePage - 1);
              }
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Previous</span>
          </button>
        </li>

        {/* Page numbers */}
        {visiblePages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <li key={`ellipsis-${index}`}>
                <span
                  aria-hidden="true"
                  className="flex justify-center items-center w-9 h-9 px-3 py-3 text-zinc-500"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                  <span className="overflow-hidden absolute p-0 -m-px w-px h-px whitespace-nowrap">
                    More pages
                  </span>
                </span>
              </li>
            );
          }
          
          const isActive = page === activePage;
          
          return (
            <li key={page}>
              <button
                className={`flex justify-center items-center w-9 h-9 px-3 py-3 text-sm font-medium no-underline bg-transparent rounded-md border ${
                  isActive 
                    ? "text-white bg-zinc-900 border-zinc-900" 
                    : "text-zinc-500 border-transparent hover:text-zinc-700 hover:border-zinc-300"
                } border-solid transition-all cursor-pointer duration-200`}
                aria-current={isActive ? "page" : undefined}
                onClick={(e) => handleNavigate(e, page)}
              >
                {page}
              </button>
            </li>
          );
        })}

        {/* Next button */}
        <li>
          <button
            className={`flex gap-1 items-center px-3 py-2 text-sm font-medium no-underline bg-transparent rounded-md border border-transparent border-solid transition-all ${
              activePage >= totalPages 
                ? "text-zinc-300 cursor-not-allowed" 
                : "text-zinc-500 hover:text-zinc-700 cursor-pointer"
            } duration-200`}
            disabled={activePage >= totalPages}
            aria-label="Go to next page"
            onClick={(e) => {
              if (activePage < totalPages) {
                handleNavigate(e, activePage + 1);
              }
            }}
          >
            <span>Next</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Pagination;