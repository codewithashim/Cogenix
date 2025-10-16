"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden py-8 sm:py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-10 sm:-left-20 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-10 sm:-right-20 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="text-center space-y-6 sm:space-y-8">
          {/* Vector Illustration */}
          <div className="relative mx-auto w-full max-w-lg mb-4 sm:mb-6 md:mb-8">
            <svg
              viewBox="0 0 800 400"
              className="w-full h-auto px-4 sm:px-0"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Floating geometric shapes in background */}
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.6" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Background circles */}
              <circle cx="150" cy="100" r="60" fill="url(#gradient1)" opacity="0.2" className="animate-float">
                <animate attributeName="cy" values="100;80;100" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="650" cy="300" r="80" fill="url(#gradient2)" opacity="0.2" className="animate-float-delayed">
                <animate attributeName="cy" values="300;320;300" dur="5s" repeatCount="indefinite" />
              </circle>

              {/* 404 Number with modern design */}
              <g filter="url(#glow)">
                <text
                  x="400"
                  y="220"
                  fontSize="180"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="url(#gradient1)"
                  className="font-sans"
                >
                  404
                </text>
              </g>

              {/* Search icon/magnifying glass */}
              <g transform="translate(580, 140)">
                <circle
                  cx="0"
                  cy="0"
                  r="40"
                  fill="none"
                  stroke="url(#gradient2)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <line
                  x1="28"
                  y1="28"
                  x2="50"
                  y2="50"
                  stroke="url(#gradient2)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 0 0"
                  to="360 0 0"
                  dur="20s"
                  repeatCount="indefinite"
                />
              </g>

              {/* Question mark */}
              <g transform="translate(180, 280)">
                <text
                  x="0"
                  y="0"
                  fontSize="60"
                  fontWeight="bold"
                  fill="url(#gradient1)"
                  opacity="0.6"
                >
                  ?
                </text>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="180,280; 180,270; 180,280"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </g>
            </svg>
          </div>

          {/* Content */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight px-2">
                Page Not Found
              </h1>
              <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mx-auto rounded-full" />
            </div>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
              The page you're looking for doesn't exist or has been moved. 
              <br className="hidden sm:block" />
              Let's get you back on track.
            </p>

            {/* Status code badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs sm:text-sm font-mono text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Error Code: 404
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center pt-4 sm:pt-6 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/"
              className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer w-full sm:w-auto"
              aria-label="Go back to home page"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm sm:text-base">Go Back Home</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 cursor-pointer w-full sm:w-auto"
              aria-label="Go back to previous page"
            >
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm sm:text-base">Go Back</span>
            </button>
          </div>

          {/* Help text */}
          <div className="pt-6 sm:pt-8 text-xs sm:text-sm text-gray-500 dark:text-gray-500 px-4">
            <p>
              Need help? Contact our{" "}
              <Link 
                href="/support" 
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer transition-colors duration-200"
              >
                support team
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}


