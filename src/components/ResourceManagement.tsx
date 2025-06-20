
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ResourceCardShimmer, ShimmerGrid } from '@/components/ui/shimmer';

interface Resource {
  id: number;
  name: string;
  type: string;
  description: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  quantity: number;
  status: string;
  tags: string[];
  created_at: string;
}

interface ResourceManagementProps {
  token: string | null;
}

const ResourceManagement: React.FC<ResourceManagementProps> = ({ token }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [bulkMode, setBulkMode] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    longitude: '',
    latitude: '',
    quantity: '',
    status: 'available',
    tags: ''
  });

  const [bulkData, setBulkData] = useState('');

  const resourceTypes = ['medical', 'food', 'water', 'shelter', 'transport', 'communication', 'rescue'];
  const statusOptions = ['available', 'allocated', 'consumed', 'damaged'];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (selectedType === 'all') {
      fetchResources();
    } else if (selectedType) {
      fetchResourcesByType();
    }
  }, [selectedType]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://disaster-backend-2hk0.onrender.com/api/resources', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResources(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch resources",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchResourcesByType = async () => {
    if (!selectedType) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://disaster-backend-2hk0.onrender.com/api/resources/type/${selectedType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResources(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch resources by type",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching resources by type:', error);
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
      if (bulkMode) {
        // Bulk resource creation
        const bulkResources = bulkData.split('\n').map(line => {
          const [name, type, description, quantity, status] = line.split(',').map(item => item.trim());
          return {
            name,
            type,
            description: description || 'Resource for emergency response',
            location: {
              type: "Point",
              coordinates: [78.4867, 17.3850] // Default coordinates
            },
            quantity: parseInt(quantity) || 1,
            status: status || 'available',
            tags: [type, 'emergency']
          };
        }).filter(resource => resource.name && resource.type);

        const response = await fetch('https://disaster-backend-2hk0.onrender.com/api/resources/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ resources: bulkResources }),
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Bulk resources created successfully",
          });
          fetchResources();
          setBulkData('');
        } else {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.error || "Bulk creation failed",
            variant: "destructive",
          });
        }
      } else {
        // Single resource creation/update
        const url = selectedResource
          ? `https://disaster-backend-2hk0.onrender.com/api/resources/${selectedResource.id}`
          : 'https://disaster-backend-2hk0.onrender.com/api/resources';

        const method = selectedResource ? 'PUT' : 'POST';
        
        const payload = {
          name: formData.name,
          type: formData.type,
          description: formData.description,
          location: {
            type: "Point",
            coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
          },
          quantity: parseInt(formData.quantity),
          status: formData.status,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

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
            description: `Resource ${selectedResource ? 'updated' : 'created'} successfully`,
          });
          fetchResources();
        } else {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.error || "Operation failed",
            variant: "destructive",
          });
        }
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting resource:', error);
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
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`https://disaster-backend-2hk0.onrender.com/api/resources/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Resource deleted successfully",
        });
        fetchResources();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete resource",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      description: resource.description,
      longitude: resource.location?.coordinates[0]?.toString() || '',
      latitude: resource.location?.coordinates[1]?.toString() || '',
      quantity: resource.quantity.toString(),
      status: resource.status,
      tags: resource.tags.join(', ')
    });
    setBulkMode(false);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedResource(null);
    setFormData({
      name: '',
      type: '',
      description: '',
      longitude: '',
      latitude: '',
      quantity: '',
      status: 'available',
      tags: ''
    });
    setBulkData('');
    setBulkMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Resource Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedResource ? 'Edit Resource' : 'Create New Resource'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex space-x-2 mb-4">
              <Button
                type="button"
                variant={!bulkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setBulkMode(false)}
              >
                Single
              </Button>
              <Button
                type="button"
                variant={bulkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setBulkMode(true)}
              >
                Bulk
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {bulkMode ? (
                <div>
                  <label className="text-sm font-medium">Bulk Resources (CSV format)</label>
                  <Textarea
                    placeholder="Name, Type, Description, Quantity, Status&#10;Water Bottles, water, Emergency water supply, 100, available&#10;Medical Kit, medical, First aid supplies, 50, available"
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: Name, Type, Description, Quantity, Status (one per line)
                  </p>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Resource Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  <Input
                    placeholder="Quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  />
                </>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : selectedResource ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filter by resource type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {resourceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <ShimmerGrid count={6} ShimmerComponent={ResourceCardShimmer} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span className="text-lg">{resource.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(resource)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Type: {resource.type}</p>
                <p className="text-sm text-gray-600 mb-2">Status: {resource.status}</p>
                <p className="text-sm text-gray-600 mb-2">Quantity: {resource.quantity}</p>
                <p className="text-sm mb-3">{resource.description}</p>
                {resource.location?.coordinates && (
                  <p className="text-xs text-gray-500 mb-2">
                    📍 {resource.location.coordinates[1]}, {resource.location.coordinates[0]}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags && resource.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Created: {new Date(resource.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {resources.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No resources found</p>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;
