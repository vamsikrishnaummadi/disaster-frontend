
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, MessageCircle, Hash } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { UpdateCardShimmer, ShimmerGrid } from '@/components/ui/shimmer';

interface SocialMediaUpdate {
  id: string;
  platform: string;
  content: string;
  author: string;
  timestamp: string;
  engagement?: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
  hashtags?: string[];
  verified?: boolean;
}

interface Disaster {
  id: number;
  title: string;
}

interface SocialMediaUpdatesProps {
  token: string | null;
}

const SocialMediaUpdates: React.FC<SocialMediaUpdatesProps> = ({ token }) => {
  const [updates, setUpdates] = useState<SocialMediaUpdate[]>([]);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDisasterId, setSelectedDisasterId] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
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

  const fetchSocialMediaUpdates = async () => {
    if (!selectedDisasterId) return;
    
    setLoading(true);
    try {
      let url = `https://disaster-backend-2hk0.onrender.com/api/social-media/disaster/${selectedDisasterId}/updates`;
      if (keywords.trim()) {
        url += `?keywords=${encodeURIComponent(keywords.trim())}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUpdates(data);
        toast({
          title: "Success",
          description: `Fetched ${data.length} social media updates`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch social media updates",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching social media updates:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return 'bg-blue-100 text-blue-800';
      case 'facebook':
        return 'bg-blue-600 text-white';
      case 'instagram':
        return 'bg-pink-100 text-pink-800';
      case 'reddit':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Social Media Updates</h2>
        <Button onClick={fetchSocialMediaUpdates} disabled={loading || !selectedDisasterId}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Fetching...' : 'Fetch Updates'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={selectedDisasterId} onValueChange={setSelectedDisasterId}>
          <SelectTrigger>
            <SelectValue placeholder="Select disaster for social media updates" />
          </SelectTrigger>
          <SelectContent>
            {disasters.map((disaster) => (
              <SelectItem key={disaster.id} value={disaster.id.toString()}>
                {disaster.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Enter keywords to filter updates (optional)"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
      </div>

      {selectedDisasterId && !loading && updates.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">No social media updates found</p>
          <p className="text-sm text-gray-400">Click "Fetch Updates" to get the latest social media posts</p>
        </div>
      )}

      {loading ? (
        <ShimmerGrid count={6} ShimmerComponent={UpdateCardShimmer} />
      ) : (
        <div className="grid gap-4">
          {updates.map((update) => (
            <Card key={update.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Badge className={getPlatformColor(update.platform)}>
                      {update.platform}
                    </Badge>
                    <span className="text-lg font-medium">@{update.author}</span>
                    {update.verified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatTimestamp(update.timestamp)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3 whitespace-pre-wrap">{update.content}</p>
                
                {update.hashtags && update.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {update.hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                )}

                {update.engagement && (
                  <div className="flex space-x-4 text-sm text-gray-600">
                    {update.engagement.likes !== undefined && (
                      <span>❤️ {update.engagement.likes.toLocaleString()}</span>
                    )}
                    {update.engagement.shares !== undefined && (
                      <span>🔄 {update.engagement.shares.toLocaleString()}</span>
                    )}
                    {update.engagement.comments !== undefined && (
                      <span>💬 {update.engagement.comments.toLocaleString()}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialMediaUpdates;
