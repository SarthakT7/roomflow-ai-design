import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const INTERIOR_STYLES = [
  {
    id: "modern",
    name: "Modern Minimalist",
    prompt: "A modern minimalist interior with clean lines, neutral colors, and sleek furniture",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"
  },
  {
    id: "bohemian",
    name: "Bohemian",
    prompt: "A bohemian interior with eclectic patterns, warm colors, plants, and textured fabrics",
    image: "https://images.unsplash.com/photo-1522444195799-478538b28823?w=400&h=300&fit=crop"
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    prompt: "A Scandinavian interior with light wood, white walls, cozy textures, and functional design",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400&h=300&fit=crop"
  },
  {
    id: "industrial",
    name: "Industrial",
    prompt: "An industrial interior with exposed brick, metal fixtures, dark colors, and urban elements",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop"
  },
  {
    id: "traditional",
    name: "Traditional",
    prompt: "A traditional interior with classic furniture, rich colors, elegant patterns, and timeless design",
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop"
  },
  {
    id: "contemporary",
    name: "Contemporary",
    prompt: "A contemporary interior with bold colors, artistic elements, mixed textures, and innovative design",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=300&fit=crop"
  }
];

const Transform = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationResult, setTransformationResult] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('room-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('room-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleTransform = async () => {
    if (!selectedFile || !selectedStyle || !user) {
      toast({
        title: "Missing information",
        description: "Please select an image and style",
        variant: "destructive"
      });
      return;
    }

    setIsTransforming(true);

    try {
      // Upload image to Supabase storage
      const imageUrl = await uploadImage(selectedFile);
      
      // Get style prompt
      const style = INTERIOR_STYLES.find(s => s.id === selectedStyle);
      if (!style) throw new Error("Style not found");

      // Create transformation record
      const { data: transformation, error: dbError } = await supabase
        .from('transformations')
        .insert({
          user_id: user.id,
          original_image_url: imageUrl,
          style_prompt: style.prompt,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Call Replicate API
      const { data, error } = await supabase.functions.invoke('transform-room', {
        body: {
          imageUrl,
          prompt: style.prompt,
          transformationId: transformation.id
        }
      });

      if (error) throw error;

      toast({
        title: "Transformation started!",
        description: "Your room transformation is being processed. You'll see the result shortly."
      });

      setTransformationResult(transformation);
      
      // Poll for completion (simplified - in production you'd use webhooks)
      setTimeout(() => {
        checkTransformationStatus(transformation.id);
      }, 10000);

    } catch (error: any) {
      console.error('Transformation error:', error);
      toast({
        title: "Transformation failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsTransforming(false);
    }
  };

  const checkTransformationStatus = async (transformationId: string) => {
    const { data, error } = await supabase
      .from('transformations')
      .select('*')
      .eq('id', transformationId)
      .single();

    if (!error && data) {
      setTransformationResult(data);
      if (data.status === 'completed' && data.transformed_image_url) {
        toast({
          title: "Transformation completed!",
          description: "Your room has been transformed successfully!"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transform Your Room</h1>
            <p className="text-muted-foreground">Upload a photo and choose your style</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Room Photo
              </CardTitle>
              <CardDescription>
                Select a clear photo of your room for the best results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Selected room"
                      className="mx-auto max-h-48 rounded-lg object-cover"
                    />
                    <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Drop your image here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>
              <Input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Style Selection */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Choose Style
              </CardTitle>
              <CardDescription>
                Select the interior design style you want
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {INTERIOR_STYLES.map((style) => (
                  <div
                    key={style.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedStyle === style.id
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <img
                      src={style.image}
                      alt={style.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-sm font-medium text-center">{style.name}</p>
                    </div>
                    {selectedStyle === style.id && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transform Button */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={handleTransform}
            disabled={!selectedFile || !selectedStyle || isTransforming}
            className="px-8"
          >
            {isTransforming ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Transforming...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Transform Room
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {transformationResult && (
          <Card className="mt-8 shadow-elegant">
            <CardHeader>
              <CardTitle>Transformation Result</CardTitle>
              <CardDescription>
                Status: {transformationResult.status}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transformationResult.status === 'completed' && transformationResult.transformed_image_url ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Original</h3>
                    <img
                      src={transformationResult.original_image_url}
                      alt="Original room"
                      className="w-full rounded-lg object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Transformed</h3>
                    <img
                      src={transformationResult.transformed_image_url}
                      alt="Transformed room"
                      className="w-full rounded-lg object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Your transformation is being processed...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Transform;