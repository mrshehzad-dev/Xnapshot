import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartData {
  date: string;
  engagement: number;
  impressions: number;
}

interface PerformanceChartProps {
  data: ChartData[];
  title: string;
}

export default function PerformanceChart({ data, title }: PerformanceChartProps) {
  const maxEngagement = Math.max(...data.map(d => d.engagement));
  const maxImpressions = Math.max(...data.map(d => d.impressions));
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEngagementHeight = (value: number) => {
    return (value / maxEngagement) * 100;
  };

  const getImpressionsHeight = (value: number) => {
    return (value / maxImpressions) * 100;
  };

  const weeklyGrowth = data.length > 1 ? 
    ((data[data.length - 1].engagement - data[0].engagement) / data[0].engagement * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {weeklyGrowth >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {weeklyGrowth >= 0 ? '+' : ''}{weeklyGrowth.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Engagement</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
            <span className="text-gray-600">Impressions</span>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center space-y-2">
              <div className="w-full h-48 bg-gray-50 rounded-lg flex items-end justify-center p-2 relative overflow-hidden">
                <div 
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                  style={{ 
                    height: `${getEngagementHeight(item.engagement)}%`,
                    width: '40%',
                    marginRight: '4px'
                  }}
                  title={`Engagement: ${item.engagement}`}
                ></div>
                <div 
                  className="bg-gradient-to-t from-teal-500 to-teal-400 rounded-sm transition-all duration-500 hover:from-teal-600 hover:to-teal-500"
                  style={{ 
                    height: `${getImpressionsHeight(item.impressions) * 0.3}%`,
                    width: '40%',
                    marginLeft: '4px'
                  }}
                  title={`Impressions: ${item.impressions}`}
                ></div>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {formatDate(item.date)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.reduce((sum, item) => sum + item.engagement, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Engagement</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-teal-600">
            {(data.reduce((sum, item) => sum + item.impressions, 0) / 1000).toFixed(1)}K
          </div>
          <div className="text-sm text-gray-600">Total Impressions</div>
        </div>
      </div>
    </div>
  );
}