
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Globe } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface GeocodingResult {
  extracted_locations: Array<{
    text: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    confidence: number;
    address_components?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
    };
  }>;
  processing_time: number;
}

interface GeocodingToolProps {
  token: string | null;
}

const GeocodingTool: React.FC<GeocodingToolProps> = ({ token }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeocodingResult | null>(null);
  const { toast } = useToast();

  const handleGeocode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('https://disaster-backend-2hk0.onrender.com/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast({
          title: "Geocoding Complete",
          description: `Found ${data.extracted_locations.length} location(s) in ${data.processing_time}ms`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Geocoding Failed",
          description: errorData.error || "Failed to process text",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error geocoding text:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const openInMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const sampleTexts = [
    "Emergency reported at 123 Main Street, New York, NY. Fire department responding to downtown area near Central Park.",
    "Flooding observed in Miami Beach, Florida and surrounding areas. Residents near Biscayne Bay should evacuate immediately.",
    "Earthquake damage reported in San Francisco, California. Pacific Heights and Mission District most affected."
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Geocoding Tool</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Extract Locations from Text</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGeocode} className="space-y-4">
            <div>
              <Textarea
                placeholder="Enter text containing location information..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                required
                rows={4}
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : 'Extract Locations'}
            </Button>
          </form>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Sample texts to test:</p>
            <div className="space-y-2">
              {sampleTexts.map((text, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText(text)}
                  className="w-full text-left justify-start h-auto p-2 whitespace-normal"
                >
                  <span className="text-xs">{text.substring(0, 100)}...</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Extracted Locations ({result.extracted_locations.length})
            </h3>
            <Badge variant="outline">
              Processed in {result.processing_time}ms
            </Badge>
          </div>

          {result.extracted_locations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No locations found in the provided text</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {result.extracted_locations.map((location, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span className="text-lg">{location.text}</span>
                      </div>
                      <Badge className={getConfidenceColor(location.confidence)}>
                        {(location.confidence * 100).toFixed(1)}% Confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Coordinates</h4>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={formatCoordinates(location.coordinates.latitude, location.coordinates.longitude)}
                            readOnly
                            className="text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openInMaps(location.coordinates.latitude, location.coordinates.longitude)}
                          >
                            <Globe className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {location.address_components && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Address Components</h4>
                          <div className="space-y-1 text-sm">
                            {location.address_components.street && (
                              <div>Street: {location.address_components.street}</div>
                            )}
                            {location.address_components.city && (
                              <div>City: {location.address_components.city}</div>
                            )}
                            {location.address_components.state && (
                              <div>State: {location.address_components.state}</div>
                            )}
                            {location.address_components.country && (
                              <div>Country: {location.address_components.country}</div>
                            )}
                            {location.address_components.postal_code && (
                              <div>Postal Code: {location.address_components.postal_code}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Confidence Score</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              location.confidence >= 0.8 ? 'bg-green-500' :
                              location.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${location.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {(location.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeocodingTool;
