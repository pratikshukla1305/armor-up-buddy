
import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Megaphone, 
  Calendar, 
  Clock,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Save,
  XCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { advisories, Advisory } from '@/data/advisoryData';

interface AdvisoryFormData {
  id: string;
  title: string;
  type: string;
  description: string;
  date: string;
  location: string;
  severity: string; // Making this required to match the interface
  issueAuthority: string;
  expiryDate?: string;
  imageUrl?: string;
  content?: string;
  regions?: string[];
}

const OfficerAdvisoryPanel = () => {
  const [advisoryData, setAdvisoryData] = useState<Advisory[]>(advisories);
  const [selectedAdvisory, setSelectedAdvisory] = useState<Advisory | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state for adding/editing
  const [formData, setFormData] = useState<AdvisoryFormData>({
    id: '',
    title: '',
    type: 'police',
    description: '',
    date: '',
    location: '',
    severity: 'medium', // Default value since it's required
    issueAuthority: '',
    expiryDate: '',
    imageUrl: '',
    content: '',
    regions: [],
  });
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };
  
  const getFilteredAdvisories = () => {
    let filtered = [...advisoryData];
    
    // Apply type filter
    if (currentTab !== 'all') {
      filtered = filtered.filter(advisory => advisory.type === currentTab);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        advisory => 
          advisory.title.toLowerCase().includes(query) || 
          advisory.description.toLowerCase().includes(query) ||
          (advisory.issueAuthority && advisory.issueAuthority.toLowerCase().includes(query))
      );
    }
    
    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return filtered;
  };
  
  const handleViewDetails = (advisory: Advisory) => {
    setSelectedAdvisory(advisory);
    setDetailsOpen(true);
  };
  
  const handleAddAdvisory = () => {
    // Reset form
    setFormData({
      id: '',
      title: '',
      type: 'police',
      description: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      severity: 'medium',
      issueAuthority: '',
      expiryDate: '',
      imageUrl: '',
      content: '',
      regions: [],
    });
    setIsEditing(false);
    setAddEditOpen(true);
  };
  
  const handleEditAdvisory = (advisory: Advisory) => {
    // Copy advisory data to form data, ensuring all required fields are populated
    setFormData({
      id: advisory.id,
      title: advisory.title,
      type: advisory.type,
      description: advisory.description,
      date: advisory.date,
      location: advisory.location,
      severity: advisory.severity || 'medium', // Default if missing
      issueAuthority: advisory.issueAuthority || '',
      expiryDate: advisory.expiryDate || '',
      imageUrl: advisory.imageUrl,
      content: advisory.content || '',
      regions: [],
    });
    setIsEditing(true);
    setAddEditOpen(true);
  };
  
  const handleDeleteClick = (advisory: Advisory) => {
    setSelectedAdvisory(advisory);
    setDeleteConfirmOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedAdvisory) {
      // Filter out the advisory to delete
      const updatedAdvisories = advisoryData.filter(a => a.id !== selectedAdvisory.id);
      setAdvisoryData(updatedAdvisories);
      
      toast({
        title: "Advisory deleted",
        description: `Advisory "${selectedAdvisory.title}" has been deleted.`,
      });
      
      setDeleteConfirmOpen(false);
    }
  };
  
  const handleSaveAdvisory = () => {
    // Validate form
    if (!formData.title || !formData.description || !formData.date || !formData.issueAuthority) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Create new advisory object based on form data
    const advisoryToSave: Advisory = {
      id: formData.id || `advisory-${Date.now()}`,
      title: formData.title,
      type: formData.type as 'police' | 'government' | 'emergency',
      description: formData.description,
      date: formData.date,
      location: formData.location,
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1567942771224-4d4d5fa2c116?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      severity: formData.severity as 'low' | 'medium' | 'high',
      issueAuthority: formData.issueAuthority,
      expiryDate: formData.expiryDate || undefined,
      content: formData.content || undefined,
    };
    
    if (isEditing) {
      // Update existing advisory
      const updatedAdvisories = advisoryData.map(a => 
        a.id === formData.id ? advisoryToSave : a
      );
      setAdvisoryData(updatedAdvisories);
      
      toast({
        title: "Advisory updated",
        description: `Advisory "${formData.title}" has been updated.`,
      });
    } else {
      // Add new advisory
      setAdvisoryData([...advisoryData, advisoryToSave]);
      
      toast({
        title: "Advisory created",
        description: `New advisory "${formData.title}" has been created.`,
      });
    }
    
    setAddEditOpen(false);
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };
  
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'police':
        return <Badge className="bg-blue-600">Police</Badge>;
      case 'government':
        return <Badge className="bg-green-600">Government</Badge>;
      case 'emergency':
        return <Badge className="bg-red-600">Emergency</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search advisories..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleAddAdvisory}
          className="bg-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Advisory
        </Button>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="police">Police</TabsTrigger>
          <TabsTrigger value="government">Government</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getFilteredAdvisories().map(advisory => (
          <Card key={advisory.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between mb-1">
                {getTypeBadge(advisory.type)}
                {advisory.severity && getSeverityBadge(advisory.severity)}
              </div>
              <CardTitle className="text-base">{advisory.title}</CardTitle>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Issued: {formatDate(advisory.date)}</span>
                {advisory.expiryDate && (
                  <>
                    <span className="mx-1">•</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Expires: {formatDate(advisory.expiryDate)}</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-2 mb-2">{advisory.description}</p>
              <div className="text-xs text-gray-500">
                Issued by: {advisory.issueAuthority || 'Unknown'}
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleViewDetails(advisory)}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleEditAdvisory(advisory)}
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDeleteClick(advisory)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {getFilteredAdvisories().length === 0 && (
          <div className="col-span-2 text-center py-8">
            <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600">No advisories found</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery 
                ? "No advisories match your search criteria."
                : "There are no advisories in this category."
              }
            </p>
            <Button 
              onClick={handleAddAdvisory}
              className="mt-4 bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Advisory
            </Button>
          </div>
        )}
      </div>

      {/* View Advisory Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        {selectedAdvisory && (
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                {getTypeBadge(selectedAdvisory.type)}
                {selectedAdvisory.severity && getSeverityBadge(selectedAdvisory.severity)}
              </div>
              <DialogTitle className="text-xl">{selectedAdvisory.title}</DialogTitle>
              <DialogDescription>
                <div className="flex items-center mt-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Issued: {formatDate(selectedAdvisory.date)}</span>
                  {selectedAdvisory.expiryDate && (
                    <>
                      <span className="mx-2">•</span>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Expires: {formatDate(selectedAdvisory.expiryDate)}</span>
                    </>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm">{selectedAdvisory.description}</p>
              </div>
              
              {selectedAdvisory.content && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Detailed Content</h3>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    {selectedAdvisory.content}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-medium">Issuing Authority</h3>
                  <p className="text-sm">{selectedAdvisory.issueAuthority || 'Unknown'}</p>
                </div>
                
                <div>
                  <h3 className="text-xs font-medium">Location</h3>
                  <p className="text-sm">{selectedAdvisory.location}</p>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setDetailsOpen(false)}
              >
                Close
              </Button>
              <Button 
                className="w-full sm:w-auto"
                onClick={() => {
                  setDetailsOpen(false);
                  handleEditAdvisory(selectedAdvisory);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Advisory
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Add/Edit Advisory Dialog */}
      <Dialog open={addEditOpen} onOpenChange={setAddEditOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Advisory' : 'Create New Advisory'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the information for this advisory' 
                : 'Fill in the details to create a new public advisory'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Advisory Title</label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter advisory title"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Advisory Type</label>
                <Select 
                  value={formData.type}
                  onValueChange={(value) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select advisory type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="police">Police Order</SelectItem>
                    <SelectItem value="government">Government Advisory</SelectItem>
                    <SelectItem value="emergency">Emergency Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Severity Level</label>
                <Select 
                  value={formData.severity}
                  onValueChange={(value) => setFormData({...formData, severity: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Issuing Authority</label>
                <Input 
                  value={formData.issueAuthority}
                  onChange={(e) => setFormData({...formData, issueAuthority: e.target.value})}
                  placeholder="Enter issuing department/agency"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Date</label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Enter affected location/area"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry Date (Optional)</label>
                <Input 
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL (Optional)</label>
                <Input 
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="Enter image URL"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-2">
            <label className="text-sm font-medium">Short Description</label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter a brief description"
              rows={2}
            />
          </div>
          
          <div className="space-y-2 mt-2">
            <label className="text-sm font-medium">Detailed Content</label>
            <Textarea 
              value={formData.content || ''}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Enter the full advisory content"
              rows={5}
            />
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setAddEditOpen(false)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              onClick={handleSaveAdvisory}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Advisory' : 'Create Advisory'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        {selectedAdvisory && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this advisory? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-3 bg-red-50 rounded-md border border-red-100 my-2">
              <p className="font-medium text-red-800">{selectedAdvisory.title}</p>
              <p className="text-sm text-red-600 mt-1">{selectedAdvisory.description}</p>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                onClick={handleDeleteConfirm}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Advisory
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default OfficerAdvisoryPanel;

