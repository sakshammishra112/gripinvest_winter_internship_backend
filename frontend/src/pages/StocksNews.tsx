import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart2, ExternalLink } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface MarketNews {
  category: string;
  datetime: number; // UNIX timestamp
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

const StocksNews: React.FC = () => {
  const [news, setNews] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/finnhub/market-news?category=business');
        
        // Clone the response to read it multiple times if needed
        const responseClone = response.clone();
        
        try {
          const data = await response.json();
          console.log('Received data:', data);
          setNews(Array.isArray(data) ? data : []);
        } catch (jsonError) {
          // If JSON parsing fails, try to read as text
          const errorText = await responseClone.text();
          console.error('Failed to parse JSON response:', errorText);
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Error in fetchNews:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stock news. Please try again later.');
        setNews([]); // Clear any existing news on error
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [user, navigate]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <BarChart2 className="h-8 w-8 mr-2 text-blue-600" />
          Market News
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Stay updated with the latest stock market news and updates
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
              <img 
                src={item.image || 'https://via.placeholder.com/400x200?text=No+Image+Available'} 
                alt={item.headline} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available';
                  target.className = 'w-full h-full object-contain p-4';
                }}
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.source}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(item.datetime)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {item.headline}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {item.summary}
              </p>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {item.category}
                </span>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Read more
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StocksNews;
