
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Filter, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { DisasterCardShimmer, ShimmerGrid } from '@/components/ui/shimmer';

interface Disaster {
  id: number;
  title: string;
  location_name: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  description: string;
  tags: string[];
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

interface DisasterManagementProps {
  token: string | null;
}

const DisasterManagement: React.FC<DisasterManagementProps> = ({ token }) => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterTag, setFilterTag] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    location_name: '',
    longitude: '',
    latitude: '',
    description: '',
    tags: ''
  });

  useEffect(() => {
    fetchDisasters();
  }, []);

  useEffect(() => {
    if (filterTag) {
      fetchDisastersByTag(filterTag);
    } else {
      fetchDisasters();
    }
  }, [filterTag]);

  const fetchDisasters = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://disaster-backend-2hk0.onrender.com/api/disasters', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDisasters(data);
        const allTagsFromDisasters = data.flatMap((disaster: Disaster) => disaster.tags || []);
        const filteredTags = allTagsFromDisasters.filter((tag: any): tag is string => typeof tag === 'string');
        const uniqueTags: string[] = Array.from(new Set(filteredTags));
        setAllTags(uniqueTags);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch disasters",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching disasters:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDisastersByTag = async (tag: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://disaster-backend-2hk0.onrender.com/api/disasters?tag=${tag}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDisasters(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to filter disasters",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error filtering disasters:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = selectedDisaster
        ? `https://disaster-backend-2hk0.onrender.com/api/disasters/${selectedDisaster.id}`
        : 'https://disaster-backend-2hk0.onrender.com/api/disasters';

      const method = selectedDisaster ? 'PUT' : 'POST';
      
      let payload: any;
      
      if (selectedDisaster) {
        // Update payload
        payload = {
          title: formData.title,
          description: formData.description,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          user_id: "current-user-id" // This should be replaced with actual current user ID
        };
      } else {
        // Create payload
        payload = {
          title: formData.title,
          location_name: formData.location_name,
          location: {
            type: "Point",
            coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
          },
          description: formData.description,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          owner_id: "current-user-id" // This should be replaced with actual current user ID
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Disaster ${selectedDisaster ? 'updated' : 'created'} successfully`,
        });
        fetchDisasters();
        resetForm();
        setIsDialogOpen(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Operation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting disaster:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this disaster?')) return;

    try {
      const response = await fetch(`https://disaster-backend-2hk0.onrender.com/api/disasters/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Disaster deleted successfully",
        });
        fetchDisasters();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete disaster",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting disaster:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (disaster: Disaster) => {
    setSelectedDisaster(disaster);
    setFormData({
      title: disaster.title,
      location_name: disaster.location_name,
      longitude: disaster.location?.coordinates[0]?.toString() || '',
      latitude: disaster.location?.coordinates[1]?.toString() || '',
      description: disaster.description,
      tags: disaster.tags.join(', ')
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedDisaster(null);
    setFormData({
      title: '',
      location_name: '',
      longitude: '',
      latitude: '',
      description: '',
      tags: ''
    });
  };

  const clearFilter = () => {
    setFilterTag('');
  };

  const selectTagFilter = (tag: string) => {
    setFilterTag(tag);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Disaster Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Disaster
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedDisaster ? 'Edit Disaster' : 'Create New Disaster'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Disaster Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              {!selectedDisaster && (
                <>
                  <Input
                    placeholder="Location Name"
                    value={formData.location_name}
                    onChange={(e) => setFormData({...formData, location_name: e.target.value})}
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      required
                    />
                    <Input
                      placeholder="Latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      required
                    />
                  </div>
                </>
              )}
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              <Input
                placeholder="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : selectedDisaster ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <Input
            placeholder="Filter by tag (or select from tags below)"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="max-w-xs"
          />
          {filterTag && (
            <Button variant="outline" size="sm" onClick={clearFilter}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Available tags (click to filter):</p>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <Badge
                  key={index}
                  variant={filterTag === tag ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => selectTagFilter(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {filterTag && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-sm text-blue-700">
              Showing {disasters.length} disaster(s) filtered by tag: <strong>"{filterTag}"</strong>
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <ShimmerGrid count={6} ShimmerComponent={DisasterCardShimmer} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {disasters.map((disaster) => (
            <Card key={disaster.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-lg">{disaster.title}</span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(disaster)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(disaster.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">📍 {disaster.location_name}</p>
                {disaster.location?.coordinates && (
                  <p className="text-xs text-gray-500 mb-2">
                    Coordinates: {disaster.location.coordinates[1]}, {disaster.location.coordinates[0]}
                  </p>
                )}
                <p className="text-sm mb-3">{disaster.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {disaster.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-gray-200"
                      onClick={() => selectTagFilter(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Created: {new Date(disaster.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {disasters.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {filterTag ? `No disasters found with tag "${filterTag}"` : "No disasters found"}
          </p>
        </div>
      )}
    </div>
  );
};

export default DisasterManagement;
