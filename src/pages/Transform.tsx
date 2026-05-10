import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { useBilling } from "@/hooks/useBilling";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, Sparkles, ArrowLeft, Download, Wallet } from "lucide-react";
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

type Transformation = Tables<"transformations">;

const Transform = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [includeFurniture, setIncludeFurniture] = useState(true);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationResult, setTransformationResult] = useState<Transformation | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { creditsBalance, freeTransformations, freeUsed, loading: billingLoading, refresh: refreshBilling } = useBilling();
  const freeRemaining = Math.max(freeTransformations - freeUsed, 0);
  const availableTransformations = creditsBalance + freeRemaining;

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

    if (!billingLoading && availableTransformations <= 0) {
      toast({
        title: "Credits required",
        description: "You've used your free transformations. Buy credits to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsTransforming(true);

    try {
      // Upload image to Supabase storage
      const imageUrl = await uploadImage(selectedFile);
      
      // Build prompt
      const style = INTERIOR_STYLES.find(s => s.id === selectedStyle);
      if (!style) throw new Error("Style not found");

      let fullPrompt = style.prompt;
      if (includeFurniture) {
        fullPrompt += ", fully furnished with stylish furniture, decorative accessories, rugs, lighting fixtures, and wall art";
      }
      if (customPrompt.trim()) {
        fullPrompt += `, ${customPrompt.trim()}`;
      }

      // Create transformation record
      const { data: transformation, error: dbError } = await supabase
        .from('transformations')
        .insert({
          user_id: user.id,
          original_image_url: imageUrl,
          style_prompt: fullPrompt,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Please sign in again before transforming a room.");

      // Call Replicate API
      const { data, error } = await supabase.functions.invoke('transform-room', {
        body: {
          imageUrl,
          prompt: fullPrompt,
          transformationId: transformation.id
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Transformation started!",
        description: "Your room transformation is being processed. You'll see the result shortly."
      });

      setTransformationResult(transformation);
      refreshBilling();
      
      // Poll for completion (simplified - in production you'd use webhooks)
      setTimeout(() => {
        checkTransformationStatus(transformation.id);
      }, 10000);

    } catch (error: unknown) {
      console.error('Transformation error:', error);
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast({
        title: "Transformation failed",
        description: message,
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
      } else if (data.status === 'failed') {
        toast({
          title: "Transformation failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      } else {
        setTimeout(() => checkTransformationStatus(transformationId), 5000);
      }
    }
  };

  // Download handler for transformed image
  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download =  'transformed-room.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast({
        title: 'Download failed',
        description: 'Could not download the image.',
        variant: 'destructive',
      });
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

        <Alert className="mb-8">
          <Wallet className="h-4 w-4" />
          <AlertTitle>Transformation balance</AlertTitle>
          <AlertDescription>
            {billingLoading ? (
              "Checking your available transformations..."
            ) : (
              <>
                You have {availableTransformations} available transformation{availableTransformations === 1 ? "" : "s"}.
                {" "}
                {freeRemaining > 0
                  ? `${freeRemaining} free and ${creditsBalance} paid credits remaining.`
                  : `${creditsBalance} paid credit${creditsBalance === 1 ? "" : "s"} remaining.`}
              </>
            )}
          </AlertDescription>
        </Alert>

        {!billingLoading && availableTransformations <= 0 && (
          <Alert variant="destructive" className="mb-8">
            <Wallet className="h-4 w-4" />
            <AlertTitle>Credits required</AlertTitle>
            <AlertDescription>
              You've used your free transformations. Visit pricing to add more credits.
              <div className="mt-3">
                <Button asChild size="sm" variant="outline">
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

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

        {/* Options */}
        <Card className="mt-8 shadow-elegant">
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="furnish-toggle" className="text-base font-medium">Include Furniture</Label>
                <p className="text-sm text-muted-foreground">Automatically add furniture and decor to the room</p>
              </div>
              <Switch
                id="furnish-toggle"
                checked={includeFurniture}
                onCheckedChange={setIncludeFurniture}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-prompt" className="text-base font-medium">Additional Details (optional)</Label>
              <Textarea
                id="custom-prompt"
                placeholder="e.g., large bookshelf, leather couch, warm lighting, indoor plants..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">Describe specific items or details you want in the room</p>
            </div>
          </CardContent>
        </Card>

        {/* Transform Button */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={handleTransform}
            disabled={!selectedFile || !selectedStyle || isTransforming || billingLoading || availableTransformations <= 0}
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
                   <div className="mt-4 flex justify-center">
                     <Button
                       size="sm"
                       className="flex items-center gap-2"
                       onClick={() => handleDownload(transformationResult.transformed_image_url)}
                     >
                       <Download className="w-4 h-4" />
                       Download
                     </Button>
                   </div>
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
