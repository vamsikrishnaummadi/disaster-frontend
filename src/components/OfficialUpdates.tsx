import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Building, Calendar, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { UpdateCardShimmer, ShimmerGrid } from '@/components/ui/shimmer';

interface OfficialUpdate {
  id: string;
  title: string;
  content: string;
  source: string;
  published_date: string;
  url?: string;
  severity?: string;
  category?: string;
}

interface Disaster {
  id: number;
  title: string;
}

interface OfficialUpdatesProps {
  token: string | null;
}

const OfficialUpdates: React.FC<OfficialUpdatesProps> = ({ token }) => {
  const [updates, setUpdates] = useState<OfficialUpdate[]>([]);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDisasterId, setSelectedDisasterId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const response = await fetch('https://disaster-backend-2hk0.onrender.com/api/disasters', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDisasters(data);
      }
    } catch (error) {
      console.error('Error fetching disasters:', error);
    }
  };

  const fetchOfficialUpdates = async () => {
    if (!selectedDisasterId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://disaster-backend-2hk0.onrender.com/disasters/${selectedDisasterId}/official-updates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUpdates(data);
        toast({
          title: "Success",
          description: `Fetched ${data.length} official updates`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch official updates",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching official updates:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    if (!severity) return 'bg-gray-100 text-gray-800';
    
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-blue-100 text-blue-800';
    
    switch (category.toLowerCase()) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      case 'advisory':
        return 'bg-yellow-100 text-yellow-800';
      case 'information':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Official Updates</h2>
        <Button onClick={fetchOfficialUpdates} disabled={loading || !selectedDisasterId}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Fetching...' : 'Fetch Updates'}
        </Button>
      </div>

      <div>
        <Select value={selectedDisasterId} onValueChange={setSelectedDisasterId}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select disaster for official updates" />
          </SelectTrigger>
          <SelectContent>
            {disasters.map((disaster) => (
              <SelectItem key={disaster.id} value={disaster.id.toString()}>
                {disaster.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDisasterId && !loading && updates.length === 0 && (
        <div className="text-center py-8">
          <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">No official updates found</p>
          <p className="text-sm text-gray-400">Click "Fetch Updates" to get the latest official announcements</p>
        </div>
      )}

      {loading ? (
        <ShimmerGrid count={4} ShimmerComponent={UpdateCardShimmer} />
      ) : (
        <div className="grid gap-4">
          {updates.map((update) => (
            <Card key={update.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2">{update.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{update.source}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {formatDate(update.published_date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {update.severity && (
                      <Badge className={getSeverityColor(update.severity)}>
                        {update.severity}
                      </Badge>
                    )}
                    {update.category && (
                      <Badge className={getCategoryColor(update.category)}>
                        {update.category}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 whitespace-pre-wrap">{update.content}</p>
                
                {update.url && (
                  <a
                    href={update.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Full Update
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficialUpdates;
