import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Camera, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Photo {
  id: number;
  filename: string;
  url: string;
  caption: string;
  location?: string;
  aiAnalysis?: string;
  analysisStatus: 'pending' | 'analyzing' | 'complete' | 'failed';
}

interface PhotosTabProps {
  assessmentId: number;
  photos: Photo[];
}

export function PhotosTab({ assessmentId, photos }: PhotosTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    setIsUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }
    
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/photos`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      toast({ title: 'Photos uploaded successfully' });
      queryClient.invalidateQueries({ queryKey: ['photos', assessmentId] });
    } catch (error) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };
  
  const analyzePhoto = useMutation({
    mutationFn: async (photoId: number) => {
      const res = await fetch(`/api/assessments/${assessmentId}/photos/${photoId}/analyze`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Analysis failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', assessmentId] });
    },
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Assessment Photos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload photos from site walks for AI analysis and report inclusion
          </p>
        </div>
        
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
            data-testid="input-photo-upload"
          />
          <Button disabled={isUploading} data-testid="button-upload-photos">
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload Photos
          </Button>
        </label>
      </div>
      
      {photos.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Camera className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Photos Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Upload photos from your site walk for AI-powered security analysis
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              data-testid={`photo-card-${photo.id}`}
              className="cursor-pointer hover-elevate overflow-hidden"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-square relative">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Assessment photo'}
                  className="w-full h-full object-cover"
                />
                {photo.analysisStatus === 'complete' && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    AI Analyzed
                  </div>
                )}
                {photo.analysisStatus === 'analyzing' && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Analyzing
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {photo.caption || 'Untitled Photo'}
                </p>
                {photo.location && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{photo.location}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Photo Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedPhoto(null)} data-testid="button-close-photo">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-y-auto max-h-[calc(90vh-60px)]">
              <div>
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  className="w-full rounded-lg"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Caption</label>
                  <Input
                    value={selectedPhoto.caption || ''}
                    placeholder="Enter caption..."
                    className="mt-1"
                    data-testid="input-photo-caption"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <Input
                    value={selectedPhoto.location || ''}
                    placeholder="e.g., Front Entry, Parking Area..."
                    className="mt-1"
                    data-testid="input-photo-location"
                  />
                </div>
                
                {selectedPhoto.analysisStatus === 'complete' && selectedPhoto.aiAnalysis && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Analysis</label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                      {selectedPhoto.aiAnalysis}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  {selectedPhoto.analysisStatus !== 'complete' && (
                    <Button
                      onClick={() => analyzePhoto.mutate(selectedPhoto.id)}
                      disabled={analyzePhoto.isPending}
                      data-testid="button-analyze-photo"
                    >
                      {analyzePhoto.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Run AI Analysis
                    </Button>
                  )}
                  <Button variant="outline" data-testid="button-save-photo">Save Changes</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
