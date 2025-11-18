import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChurchSearch } from '../hooks/useChurches';

export function ChurchSearchPage() {
  const navigate = useNavigate();
  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useState<{ county?: string; town?: string }>({});

  const { data, isLoading, error, isError } = useChurchSearch({
    county: searchParams.county,
    town: searchParams.town,
    page,
    limit: 20,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (county.trim() || town.trim()) {
      setSearchParams({
        county: county.trim() || undefined,
        town: town.trim() || undefined,
      });
      setPage(1);
    }
  };

  const handleChurchClick = (churchId: string) => {
    navigate(`/churches/${churchId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Stained Glass Window Tracker
          </h1>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            My Profile
          </button>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-2">
                County
              </label>
              <input
                id="county"
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="e.g., Yorkshire"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="town" className="block text-sm font-medium text-gray-700 mb-2">
                Town
              </label>
              <input
                id="town"
                type="text"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                placeholder="e.g., York"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!county && !town}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </form>

        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Loading churches...</p>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              Error loading churches: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {data && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              <p className="text-sm text-gray-600">
                Found {data.pagination.total} church{data.pagination.total !== 1 ? 'es' : ''}
                {data.pagination.totalPages > 1 && ` (Page ${data.pagination.page} of ${data.pagination.totalPages})`}
              </p>
            </div>

            {data.churches.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No churches found matching your search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.churches.map((church) => (
                  <div
                    key={church.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleChurchClick(church.id)}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {church.name}
                    </h2>
                    <p className="text-gray-600">
                      {church.town}, {church.county}
                    </p>
                    {church.floor_plan_url && (
                      <p className="text-sm text-green-600 mt-2">✓ Floor plan available</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={data.pagination.page === data.pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

