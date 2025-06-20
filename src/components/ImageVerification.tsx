
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Image, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface VerificationResult {
  image_url: string;
  is_authentic: boolean;
  confidence_score: number;
  analysis: {
    metadata_check?: boolean;
    reverse_image_search?: boolean;
    ai_detection?: boolean;
    forensic_analysis?: boolean;
  };
  details: string;
  timestamp: string;
}

interface ImageVerificationProps {
  token: string | null;
}

const ImageVerification: React.FC<ImageVerificationProps> = ({ token }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('https://disaster-backend-2hk0.onrender.com/api/social-media/verify-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast({
          title: "Verification Complete",
          description: `Image ${data.is_authentic ? 'appears authentic' : 'may be manipulated'}`,
          variant: data.is_authentic ? "default" : "destructive",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Verification Failed",
          description: errorData.error || "Failed to verify image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying image:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getVerificationIcon = (is_authentic: boolean, confidence: number) => {
    if (confidence < 0.5) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
    return is_authentic ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const sampleImages = [
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500',
    'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500',
    'https://images.unsplash.com/photo-1574482620971-2ad0409f4099?w=500'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Image Verification</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="h-5 w-5" />
            <span>Verify Image Authenticity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerification} className="space-y-4">
            <div>
              <Input
                type="url"
                placeholder="Enter image URL to verify"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              {loading ? 'Verifying...' : 'Verify Image'}
            </Button>
          </form>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Sample images to test:</p>
            <div className="flex space-x-2">
              {sampleImages.map((url, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setImageUrl(url)}
                >
                  Sample {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getVerificationIcon(result.is_authentic, result.confidence_score)}
                <span>Verification Result</span>
              </div>
              <Badge className={getConfidenceColor(result.confidence_score)}>
                {(result.confidence_score * 100).toFixed(1)}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <img
                  src={result.image_url}
                  alt="Verified image"
                  className="max-w-full h-64 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Status</h4>
                  <Badge variant={result.is_authentic ? "default" : "destructive"}>
                    {result.is_authentic ? "Likely Authentic" : "Potentially Manipulated"}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Confidence</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          result.confidence_score >= 0.8 ? 'bg-green-500' :
                          result.confidence_score >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.confidence_score * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {(result.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Analysis Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(result.analysis).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <Badge variant={value ? "default" : "secondary"} className="text-xs">
                        {value ? "✓" : "○"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Details</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {result.details}
                </p>
              </div>

              <div className="text-xs text-gray-500">
                Verified at: {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageVerification;
