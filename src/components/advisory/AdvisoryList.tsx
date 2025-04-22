
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import AdvisoryCard from './AdvisoryCard';
import { advisories } from '@/data/advisoryData';

const AdvisoryList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredAdvisories = advisories.filter(advisory => 
    advisory.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    advisory.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search advisories..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-gray-300 flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            All
          </TabsTrigger>
          <TabsTrigger value="police" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Police Orders
          </TabsTrigger>
          <TabsTrigger value="government" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Government
          </TabsTrigger>
          <TabsTrigger value="emergency" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Emergency
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAdvisories.length > 0 ? (
              filteredAdvisories.map(advisory => (
                <AdvisoryCard key={advisory.id} advisory={advisory} />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No advisories found matching your search.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="police" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAdvisories
              .filter(advisory => advisory.type === 'police')
              .map(advisory => (
                <AdvisoryCard key={advisory.id} advisory={advisory} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="government" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAdvisories
              .filter(advisory => advisory.type === 'government')
              .map(advisory => (
                <AdvisoryCard key={advisory.id} advisory={advisory} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="emergency" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAdvisories
              .filter(advisory => advisory.type === 'emergency')
              .map(advisory => (
                <AdvisoryCard key={advisory.id} advisory={advisory} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvisoryList;
