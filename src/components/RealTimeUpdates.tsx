
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, FileText, Trash2 } from 'lucide-react';

interface RealTimeUpdate {
  id: string;
  type: 'disaster-update' | 'resource-update' | 'report-update' | 'social_media_updated';
  data: any;
  timestamp: string;
}

interface RealTimeUpdatesProps {
  socket: any;
}

const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({ socket }) => {
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    setIsConnected(socket.connected);

    socket.on('connect', () => {
      console.log('Real-time connection established');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Real-time connection lost');
      setIsConnected(false);
    });

    // Listen for disaster updates
    socket.on('disaster-update', (data: any) => {
      console.log('Disaster update received:', data);
      addUpdate('disaster-update', data);
    });

    // Listen for resource updates
    socket.on('resource-update', (data: any) => {
      console.log('Resource update received:', data);
      addUpdate('resource-update', data);
    });

    // Listen for report updates
    socket.on('report-update', (data: any) => {
      console.log('Report update received:', data);
      addUpdate('report-update', data);
    });

    // Listen for social media updates
    socket.on('social_media_updated', (data: any) => {
      console.log('Social media update received:', data);
      addUpdate('social_media_updated', data);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('disaster-update');
      socket.off('resource-update');
      socket.off('report-update');
      socket.off('social_media_updated');
    };
  }, [socket]);

  const addUpdate = (type: RealTimeUpdate['type'], data: any) => {
    const newUpdate: RealTimeUpdate = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    setUpdates(prev => [newUpdate, ...prev.slice(0, 49)]); // Keep last 50 updates
  };

  const clearUpdates = () => {
    setUpdates([]);
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'disaster-update':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'resource-update':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'report-update':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'social_media_updated':
        return <div className="h-4 w-4 bg-purple-500 rounded-full" />;
      default:
        return <div className="h-4 w-4 bg-gray-500 rounded-full" />;
    }
  };

  const getUpdateTitle = (type: string) => {
    switch (type) {
      case 'disaster-update':
        return 'Disaster Update';
      case 'resource-update':
        return 'Resource Update';
      case 'report-update':
        return 'Report Update';
      case 'social_media_updated':
        return 'Social Media Update';
      default:
        return 'Unknown Update';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'disaster-update':
        return 'bg-red-100 text-red-800';
      case 'resource-update':
        return 'bg-blue-100 text-blue-800';
      case 'report-update':
        return 'bg-green-100 text-green-800';
      case 'social_media_updated':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUpdateData = (data: any) => {
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Real-time Updates</h2>
        <div className="flex items-center space-x-4">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button onClick={clearUpdates} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {!isConnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span>WebSocket connection is not active. Real-time updates may not be received.</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {updates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <AlertTriangle className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500 mb-2">No real-time updates yet</p>
              <p className="text-sm text-gray-400">
                Updates will appear here as they happen in other sections of the app
              </p>
            </CardContent>
          </Card>
        ) : (
          updates.map((update) => (
            <Card key={update.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getUpdateIcon(update.type)}
                    <span className="text-lg">{getUpdateTitle(update.type)}</span>
                    <Badge className={getTypeColor(update.type)}>
                      {update.type}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500 font-normal">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded p-3">
                  <pre className="text-sm whitespace-pre-wrap text-gray-700 overflow-x-auto">
                    {formatUpdateData(update.data)}
                  </pre>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Received at: {new Date(update.timestamp).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {updates.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {updates.length} recent update{updates.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default RealTimeUpdates;
