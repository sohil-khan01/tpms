// Reusable loading components used across all pages

// Full-page centered spinner — use when entire page content is loading
export function PageLoader({ message = 'Loading...', darkMode }) {
  return (
    <div className={`flex items-center justify-center min-h-[60vh] w-full ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-b-purple-400 animate-spin animation-delay-150"
            style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{message}</p>
      </div>
    </div>
  );
}

// Inline spinner — use inside cards/sections (small)
export function InlineLoader({ message, darkMode, size = 'md' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex items-center justify-center gap-3 py-6">
      <div className={`${sizes[size]} rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin flex-shrink-0`} />
      {message && (
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{message}</p>
      )}
    </div>
  );
}

// Skeleton card — use as placeholder for a stat/metric card
export function SkeletonCard({ darkMode }) {
  return (
    <div className={`rounded-xl p-6 border shadow-sm animate-pulse ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className={`w-10 h-4 rounded ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
      </div>
      <div className={`w-24 h-3 rounded mb-2 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
      <div className={`w-16 h-8 rounded ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
    </div>
  );
}

// Skeleton table row — use as placeholder inside a table while loading
export function SkeletonRow({ cols = 5, darkMode }) {
  return (
    <tr className={`border-t animate-pulse ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className={`h-4 rounded ${i === 0 ? 'w-32' : i === cols - 1 ? 'w-16' : 'w-24'} ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        </td>
      ))}
    </tr>
  );
}

// Skeleton candidate card — use in candidate lists while loading
export function SkeletonCandidateCard({ darkMode }) {
  return (
    <div className={`rounded-xl border p-6 animate-pulse ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-full flex-shrink-0 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-4 rounded w-40 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`h-3 rounded w-56 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        </div>
        <div className={`w-14 h-8 rounded-lg flex-shrink-0 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
      </div>
      <div className="flex gap-2 flex-wrap">
        {[60, 44, 52, 40].map((w, i) => (
          <div key={i} className={`h-6 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

// Skeleton list item — for sidebar / small list entries
export function SkeletonListItem({ darkMode }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border-2 animate-pulse ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
      <div className={`w-10 h-10 rounded-full flex-shrink-0 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
      <div className="flex-1 space-y-1.5">
        <div className={`h-3.5 rounded w-32 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className={`h-3 rounded w-44 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
      </div>
    </div>
  );
}

// Button-level spinner (inline inside a button while action is in progress)
export function ButtonLoader({ text = 'Loading...' }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
      {text}
    </span>
  );
}
