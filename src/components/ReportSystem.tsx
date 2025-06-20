
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ReportCardShimmer, ShimmerGrid } from '@/components/ui/shimmer';

interface Report {
  id: number;
  content: string;
  image_url?: string;
  verification_status: string;
  disaster_id: number;
  created_at: string;
  updated_at: string;
}

interface Disaster {
  id: number;
  title: string;
}

interface ReportSystemProps {
  token: string | null;
}

const ReportSystem: React.FC<ReportSystemProps> = ({ token }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDisasterId, setSelectedDisasterId] = useState<string>('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    content: '',
    image_url: '',
    disaster_id: ''
  });

  useEffect(() => {
    fetchDisasters();
  }, []);

  useEffect(() => {
    if (selectedDisasterId) {
      fetchReports();
    }
  }, [selectedDisasterId]);

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

  const fetchReports = async () => {
    if (!selectedDisasterId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://disaster-backend-2hk0.onrender.com/api/reports/disaster/${selectedDisasterId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch reports",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
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
      const url = selectedReport
        ? `https://disaster-backend-2hk0.onrender.com/api/reports/${selectedReport.id}`
        : 'https://disaster-backend-2hk0.onrender.com/api/reports';

      const method = selectedReport ? 'PUT' : 'POST';
      
      const payload = {
        disaster_id: formData.disaster_id,
        content: formData.content,
        image_url: formData.image_url
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
          description: `Report ${selectedReport ? 'updated' : 'created'} successfully`,
        });
        fetchReports();
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
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReport = async (reportId: number, status: string) => {
    try {
      const response = await fetch(`https://disaster-backend-2hk0.onrender.com/api/reports/${reportId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Report ${status} successfully`,
        });
        fetchReports();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Verification failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying report:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`https://disaster-backend-2hk0.onrender.com/api/reports/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Report deleted successfully",
        });
        fetchReports();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete report",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (report: Report) => {
    setSelectedReport(report);
    setFormData({
      content: report.content,
      image_url: report.image_url || '',
      disaster_id: report.disaster_id.toString()
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedReport(null);
    setFormData({
      content: '',
      image_url: '',
      disaster_id: selectedDisasterId || ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Report System</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedReport ? 'Edit Report' : 'Create New Report'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                value={formData.disaster_id}
                onValueChange={(value) => setFormData({...formData, disaster_id: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Disaster" />
                </SelectTrigger>
                <SelectContent>
                  {disasters.map((disaster) => (
                    <SelectItem key={disaster.id} value={disaster.id.toString()}>
                      {disaster.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Report Content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
                rows={4}
              />

              <Input
                placeholder="Image URL (required)"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                type="url"
                required
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : selectedReport ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <Select value={selectedDisasterId} onValueChange={setSelectedDisasterId}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select disaster to view reports" />
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

      {selectedDisasterId && (
        <>
          {loading ? (
            <ShimmerGrid count={4} ShimmerComponent={ReportCardShimmer} />
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.verification_status)}
                        <span className="text-lg">Report #{report.id}</span>
                        <Badge className={getStatusColor(report.verification_status)}>
                          {report.verification_status}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        {report.verification_status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyReport(report.id, 'verified')}
                              className="text-green-600"
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyReport(report.id, 'rejected')}
                              className="text-red-600"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(report)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{report.content}</p>
                    {report.image_url && (
                      <div className="mb-3">
                        <img
                          src={report.image_url}
                          alt="Report image"
                          className="max-w-full h-48 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Created: {new Date(report.created_at).toLocaleString()}</span>
                      <span>Updated: {new Date(report.updated_at).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {selectedDisasterId && reports.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No reports found for this disaster</p>
        </div>
      )}
    </div>
  );
};

export default ReportSystem;
