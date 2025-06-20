
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, LogOut, Wifi, WifiOff } from 'lucide-react';
import DisasterManagement from './DisasterManagement';
import ResourceManagement from './ResourceManagement';
import ReportSystem from './ReportSystem';
import SocialMediaUpdates from './SocialMediaUpdates';
import OfficialUpdates from './OfficialUpdates';
import ImageVerification from './ImageVerification';
import GeocodingTool from './GeocodingTool';
import RealTimeUpdates from './RealTimeUpdates';
import io from 'socket.io-client';

interface DashboardProps {
  token: string | null;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ token, onLogout }) => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io('https://disaster-backend-2hk0.onrender.com', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <h1 className="text-xl font-bold text-gray-900">
                Disaster Response Platform
              </h1>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="disasters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="disasters">Disasters</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="official">Official</TabsTrigger>
            <TabsTrigger value="geocoding">Geocoding</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
          </TabsList>

          <TabsContent value="disasters">
            <DisasterManagement token={token} />
          </TabsContent>

          <TabsContent value="resources">
            <ResourceManagement token={token} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportSystem token={token} />
          </TabsContent>

          <TabsContent value="social">
            <SocialMediaUpdates token={token} />
          </TabsContent>

          <TabsContent value="official">
            <OfficialUpdates token={token} />
          </TabsContent>

          <TabsContent value="geocoding">
            <GeocodingTool token={token} />
          </TabsContent>

          <TabsContent value="verify">
            <ImageVerification token={token} />
          </TabsContent>

          <TabsContent value="realtime">
            <RealTimeUpdates socket={socket} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
