
import React, { useState, useEffect } from 'react';
import { getAllEvidence, getEvidenceById } from '@/services/officerServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, FileImage, FileVideo, File, Search, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Evidence } from '@/types/officer';

const EvidenceViewer = () => {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchEvidence = async () => {
    try {
      setIsLoading(true);
      const data = await getAllEvidence();
      console.log("Fetched evidence:", data);
      setEvidence(data);
    } catch (error: any) {
      console.error("Error fetching evidence:", error);
      toast.error("Failed to fetch evidence data", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const getEvidenceTypeIcon = (type: string = '') => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('image')) return <FileImage className="h-6 w-6 text-blue-500" />;
    if (lowerType.includes('video')) return <FileVideo className="h-6 w-6 text-purple-500" />;
    if (lowerType.includes('document') || lowerType.includes('pdf')) 
      return <FileText className="h-6 w-6 text-red-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const filteredEvidence = evidence.filter(item => {
    const matchesSearch = 
      (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    return item.type?.toLowerCase().includes(activeTab) && matchesSearch;
  });

  const handleViewEvidence = (item: Evidence) => {
    setSelectedEvidence(item);
  };

  const handleClearSelection = () => {
    setSelectedEvidence(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        <div className="relative flex items-center w-full md:w-64">
          <Search className="absolute left-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search evidence..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="absolute right-2.5"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Loading evidence...</span>
        </div>
      ) : filteredEvidence.length === 0 ? (
        <div className="text-center py-12 border rounded-md">
          <File className="h-12 w-12 mx-auto text-gray-300" />
          <p className="mt-2 text-gray-500">No evidence found</p>
          {searchTerm && (
            <p className="text-sm text-gray-400">Try adjusting your search term</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvidence.map((item) => (
            <Card 
              key={item.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewEvidence(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-md mr-3">
                    {getEvidenceTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-medium truncate">{item.title || 'Untitled'}</h3>
                    <p className="text-sm text-gray-500 truncate">{item.description || 'No description'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.type || 'Unknown type'}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(item.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:p-8">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">{selectedEvidence.title || 'Evidence Details'}</h2>
              <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Evidence Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Title</dt>
                      <dd>{selectedEvidence.title || 'Untitled'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Description</dt>
                      <dd>{selectedEvidence.description || 'No description provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Type</dt>
                      <dd>{selectedEvidence.type || 'Unknown'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Uploaded</dt>
                      <dd>{new Date(selectedEvidence.uploaded_at).toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">ID</dt>
                      <dd className="text-xs">{selectedEvidence.id}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Preview</h3>
                  {selectedEvidence.storage_path ? (
                    <div className="border rounded-md p-2 h-[200px] flex items-center justify-center">
                      {selectedEvidence.type?.includes('image') ? (
                        <img 
                          src={selectedEvidence.storage_path} 
                          alt={selectedEvidence.title || 'Evidence'} 
                          className="max-h-full object-contain"
                        />
                      ) : selectedEvidence.type?.includes('video') ? (
                        <video 
                          src={selectedEvidence.storage_path} 
                          controls 
                          className="max-h-full max-w-full"
                        />
                      ) : (
                        <div className="text-center">
                          {getEvidenceTypeIcon(selectedEvidence.type)}
                          <p className="text-sm mt-2">Preview not available</p>
                          <Button size="sm" className="mt-2" asChild>
                            <a href={selectedEvidence.storage_path} target="_blank" rel="noopener noreferrer">
                              Download
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-md p-4 text-center text-gray-500">
                      No file available
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={handleClearSelection}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceViewer;
