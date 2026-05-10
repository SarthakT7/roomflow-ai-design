import { useState, useRef, useCallback } from "react";
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
import { Upload, Sparkles, ArrowLeft, Download, Wallet, Check, X, LayoutDashboard, Palette, MoveHorizontal } from "lucide-react";
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

const ROOM_TYPES = [
  { id: "living-room", name: "Living Room", emoji: "🛋️" },
  { id: "bedroom", name: "Bedroom", emoji: "🛏️" },
  { id: "kitchen", name: "Kitchen", emoji: "🍳" },
  { id: "bathroom", name: "Bathroom", emoji: "🚿" },
  { id: "dining-room", name: "Dining Room", emoji: "🍽️" },
  { id: "home-office", name: "Home Office", emoji: "💻" },
  { id: "hallway", name: "Hallway", emoji: "🚪" },
];

const FURNITURE_BY_ROOM: Record<string, string[]> = {
  "living-room": ["Sofa", "Coffee Table", "TV Stand", "Armchair", "Bookshelf", "Side Table", "Floor Lamp", "Area Rug", "Ottoman", "Curtains", "Wall Art", "Fireplace"],
  "bedroom": ["Bed", "Wardrobe", "Dresser", "Nightstand", "Desk", "Bench", "Vanity", "Ceiling Light", "Curtains", "Armchair", "Mirror", "Bookshelf"],
  "kitchen": ["Kitchen Island", "Bar Stools", "Open Shelves", "Pendant Lights", "Pantry Cabinet", "Breakfast Nook", "Pot Rack", "Wine Rack"],
  "bathroom": ["Vanity", "Mirror", "Bathtub", "Walk-in Shower", "Towel Rack", "Storage Cabinet", "Plant", "Heated Towel Rail"],
  "dining-room": ["Dining Table", "Dining Chairs", "Sideboard", "Chandelier", "China Cabinet", "Area Rug", "Bar Cart", "Bench Seating"],
  "home-office": ["Desk", "Office Chair", "Bookshelf", "Filing Cabinet", "Monitor Stand", "Floor Lamp", "Whiteboard", "Sofa", "Coffee Table"],
  "hallway": ["Console Table", "Mirror", "Coat Rack", "Bench", "Wall Art", "Area Rug", "Shoe Cabinet", "Pendant Light"],
};

const WALL_COLORS = [
  { id: "white", name: "White", hex: "#F8F8F8", prompt: "white" },
  { id: "cream", name: "Cream", hex: "#F5F0E0", prompt: "warm cream" },
  { id: "light-gray", name: "Light Gray", hex: "#D8D8D8", prompt: "light gray" },
  { id: "charcoal", name: "Charcoal", hex: "#4A4A4A", prompt: "charcoal" },
  { id: "navy", name: "Navy", hex: "#1B2A4A", prompt: "deep navy" },
  { id: "sage", name: "Sage Green", hex: "#87A878", prompt: "sage green" },
  { id: "terracotta", name: "Terracotta", hex: "#C17A5A", prompt: "terracotta" },
  { id: "blush", name: "Blush Pink", hex: "#E8C4B8", prompt: "blush pink" },
  { id: "olive", name: "Olive", hex: "#7A8A5A", prompt: "olive green" },
  { id: "dusty-blue", name: "Dusty Blue", hex: "#7A9EB5", prompt: "dusty blue" },
];

const ACCENT_COLORS = [
  { id: "gold", name: "Gold", hex: "#D4A843", prompt: "gold" },
  { id: "brass", name: "Brass", hex: "#B8956A", prompt: "brass" },
  { id: "black", name: "Matte Black", hex: "#1A1A1A", prompt: "matte black" },
  { id: "copper", name: "Copper", hex: "#C87941", prompt: "copper" },
  { id: "teal", name: "Teal", hex: "#2A7A7A", prompt: "teal" },
  { id: "burgundy", name: "Burgundy", hex: "#8A2A3A", prompt: "burgundy" },
  { id: "emerald", name: "Emerald", hex: "#2A6A4A", prompt: "emerald green" },
  { id: "warm-wood", name: "Warm Wood", hex: "#A0693A", prompt: "warm wood tones" },
  { id: "silver", name: "Silver", hex: "#B0B8C0", prompt: "silver" },
  { id: "blush-rose", name: "Blush Rose", hex: "#D88888", prompt: "blush rose" },
];

type FurnitureState = "neutral" | "include" | "exclude";
type Transformation = Tables<"transformations">;

const Transform = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");
  const [furnitureSelections, setFurnitureSelections] = useState<Record<string, FurnitureState>>({});
  const [wallColor, setWallColor] = useState<string>("");
  const [accentColor, setAccentColor] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationResult, setTransformationResult] = useState<Transformation | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
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
        toast({ title: "Invalid file type", description: "Please select an image file", variant: "destructive" });
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      toast({ title: "Invalid file type", description: "Please select an image file", variant: "destructive" });
    }
  };

  const handleRoomTypeSelect = (roomId: string) => {
    if (selectedRoomType === roomId) {
      setSelectedRoomType("");
      setFurnitureSelections({});
    } else {
      setSelectedRoomType(roomId);
      setFurnitureSelections({});
    }
  };

  const toggleFurniture = (item: string) => {
    setFurnitureSelections(prev => {
      const current = prev[item] || "neutral";
      const next: FurnitureState =
        current === "neutral" ? "include" :
        current === "include" ? "exclude" : "neutral";
      if (next === "neutral") {
        const { [item]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item]: next };
    });
  };

  const updateSliderFromEvent = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  }, []);

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateSliderFromEvent(e.clientX);
  };

  const handleSliderMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    updateSliderFromEvent(e.clientX);
  }, [isDragging, updateSliderFromEvent]);

  const handleSliderMouseUp = useCallback(() => setIsDragging(false), []);

  const handleSliderTouchMove = (e: React.TouchEvent) => {
    updateSliderFromEvent(e.touches[0].clientX);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('room-images').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('room-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleTransform = async () => {
    if (!selectedFile || !selectedStyle || !user) {
      toast({ title: "Missing information", description: "Please select an image and style", variant: "destructive" });
      return;
    }
    if (!billingLoading && availableTransformations <= 0) {
      toast({ title: "Credits required", description: "You've used your free transformations. Buy credits to continue.", variant: "destructive" });
      return;
    }

    setIsTransforming(true);

    try {
      const imageUrl = await uploadImage(selectedFile);

      const style = INTERIOR_STYLES.find(s => s.id === selectedStyle);
      if (!style) throw new Error("Style not found");

      let fullPrompt = style.prompt;

      if (selectedRoomType) {
        const roomType = ROOM_TYPES.find(r => r.id === selectedRoomType);
        if (roomType) fullPrompt += ` in a ${roomType.name.toLowerCase()}`;
      }

      const included = Object.entries(furnitureSelections)
        .filter(([, state]) => state === "include")
        .map(([item]) => item.toLowerCase());
      const excluded = Object.entries(furnitureSelections)
        .filter(([, state]) => state === "exclude")
        .map(([item]) => item.toLowerCase());

      if (included.length > 0) {
        fullPrompt += `, featuring ${included.join(", ")}`;
      } else {
        fullPrompt += ", fully furnished with stylish furniture, decorative accessories, rugs, and lighting";
      }
      if (excluded.length > 0) fullPrompt += `, without any ${excluded.join(", ")}`;

      if (wallColor) {
        const color = WALL_COLORS.find(c => c.id === wallColor);
        if (color) fullPrompt += `, ${color.prompt} painted walls`;
      }
      if (accentColor) {
        const color = ACCENT_COLORS.find(c => c.id === accentColor);
        if (color) fullPrompt += `, ${color.prompt} accents and decorative details`;
      }

      if (customPrompt.trim()) fullPrompt += `, ${customPrompt.trim()}`;

      const { data: transformation, error: dbError } = await supabase
        .from('transformations')
        .insert({ user_id: user.id, original_image_url: imageUrl, style_prompt: fullPrompt, status: 'pending' })
        .select()
        .single();
      if (dbError) throw dbError;

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Please sign in again before transforming a room.");

      const { error } = await supabase.functions.invoke('transform-room', {
        body: { imageUrl, prompt: fullPrompt, transformationId: transformation.id },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (error) throw error;

      toast({ title: "Transformation started!", description: "Your room transformation is being processed. You'll see the result shortly." });
      setTransformationResult(transformation);
      setSliderPosition(50);
      refreshBilling();
      setTimeout(() => checkTransformationStatus(transformation.id), 10000);

    } catch (error: unknown) {
      console.error('Transformation error:', error);
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast({ title: "Transformation failed", description: message, variant: "destructive" });
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
        toast({ title: "Transformation completed!", description: "Your room has been transformed successfully!" });
      } else if (data.status === 'failed') {
        toast({ title: "Transformation failed", description: "Something went wrong. Please try again.", variant: "destructive" });
      } else {
        setTimeout(() => checkTransformationStatus(transformationId), 5000);
      }
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'transformed-room.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast({ title: 'Download failed', description: 'Could not download the image.', variant: 'destructive' });
    }
  };

  const furnitureItems = selectedRoomType ? FURNITURE_BY_ROOM[selectedRoomType] ?? [] : [];
  const includedCount = Object.values(furnitureSelections).filter(s => s === "include").length;
  const excludedCount = Object.values(furnitureSelections).filter(s => s === "exclude").length;

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
            {billingLoading ? "Checking your available transformations..." : (
              <>
                You have {availableTransformations} available transformation{availableTransformations === 1 ? "" : "s"}.{" "}
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
              <CardDescription>Select a clear photo of your room for the best results</CardDescription>
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
                    <img src={URL.createObjectURL(selectedFile)} alt="Selected room" className="mx-auto max-h-48 rounded-lg object-cover" />
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
              <Input id="file-input" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </CardContent>
          </Card>

          {/* Style Selection */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Choose Style
              </CardTitle>
              <CardDescription>Select the interior design style you want</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {INTERIOR_STYLES.map((style) => (
                  <div
                    key={style.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedStyle === style.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <img src={style.image} alt={style.name} className="w-full h-24 object-cover" />
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

        {/* Room Type Selection */}
        <Card className="mt-8 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              Room Type
            </CardTitle>
            <CardDescription>Tell us what kind of room this is for more accurate results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {ROOM_TYPES.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleRoomTypeSelect(room.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                    selectedRoomType === room.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <span>{room.emoji}</span>
                  <span>{room.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Furniture Filters */}
        <Card className="mt-8 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Furniture Preferences
            </CardTitle>
            <CardDescription>
              Click once to <span className="text-green-600 font-medium">include</span> an item, click again to <span className="text-red-600 font-medium">exclude</span> it, click a third time to clear.
              {!selectedRoomType && " Select a room type above to see suggested furniture."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedRoomType ? (
              <>
                {(includedCount > 0 || excludedCount > 0) && (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pb-2 border-b">
                    {includedCount > 0 && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Check className="w-3 h-3" /> {includedCount} included
                      </span>
                    )}
                    {excludedCount > 0 && (
                      <span className="flex items-center gap-1 text-red-600 ml-2">
                        <X className="w-3 h-3" /> {excludedCount} excluded
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setFurnitureSelections({})}
                      className="ml-auto text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      Clear all
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {furnitureItems.map((item) => {
                    const state = furnitureSelections[item] || "neutral";
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleFurniture(item)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          state === "include"
                            ? "bg-green-50 border-green-400 text-green-700 hover:bg-green-100"
                            : state === "exclude"
                            ? "bg-red-50 border-red-400 text-red-700 hover:bg-red-100 line-through"
                            : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {state === "include" && <Check className="w-3 h-3" />}
                        {state === "exclude" && <X className="w-3 h-3" />}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Select a room type above to choose specific furniture items to include or exclude.
              </p>
            )}

            <div className="space-y-2 pt-2">
              <Label htmlFor="custom-prompt" className="text-base font-medium">Additional Details (optional)</Label>
              <Textarea
                id="custom-prompt"
                placeholder="e.g., warm lighting, indoor plants, exposed wooden beams..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">Describe any other specific details you want in the room</p>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card className="mt-8 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Palette
            </CardTitle>
            <CardDescription>Choose wall and accent colors to personalise the design</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wall Color */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Wall Color</Label>
                {wallColor && (
                  <button
                    type="button"
                    onClick={() => setWallColor("")}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {WALL_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    title={color.name}
                    onClick={() => setWallColor(wallColor === color.id ? "" : color.id)}
                    className={`relative w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${
                      wallColor === color.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {wallColor === color.id && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className={`w-4 h-4 ${color.id === "white" || color.id === "cream" || color.id === "light-gray" || color.id === "blush" ? "text-gray-600" : "text-white"}`} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {wallColor && (
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{WALL_COLORS.find(c => c.id === wallColor)?.name}</span>
                </p>
              )}
            </div>

            {/* Accent Color */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Accent Color</Label>
                {accentColor && (
                  <button
                    type="button"
                    onClick={() => setAccentColor("")}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    title={color.name}
                    onClick={() => setAccentColor(accentColor === color.id ? "" : color.id)}
                    className={`relative w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${
                      accentColor === color.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {accentColor === color.id && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className={`w-4 h-4 ${color.id === "silver" ? "text-gray-600" : "text-white"}`} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {accentColor && (
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{ACCENT_COLORS.find(c => c.id === accentColor)?.name}</span>
                </p>
              )}
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

        {/* Results with Before/After Slider */}
        {transformationResult && (
          <Card className="mt-8 shadow-elegant">
            <CardHeader>
              <CardTitle>Transformation Result</CardTitle>
              <CardDescription>Status: {transformationResult.status}</CardDescription>
            </CardHeader>
            <CardContent>
              {transformationResult.status === 'completed' && transformationResult.transformed_image_url ? (
                <div className="space-y-4">
                  {/* Slider */}
                  <div
                    ref={sliderContainerRef}
                    className="relative rounded-lg overflow-hidden cursor-ew-resize select-none"
                    style={{ userSelect: 'none' }}
                    onMouseDown={handleSliderMouseDown}
                    onMouseMove={handleSliderMouseMove}
                    onMouseUp={handleSliderMouseUp}
                    onMouseLeave={handleSliderMouseUp}
                    onTouchMove={handleSliderTouchMove}
                    onTouchEnd={handleSliderMouseUp}
                  >
                    {/* After (transformed) — base layer */}
                    <img
                      src={transformationResult.transformed_image_url}
                      alt="Transformed room"
                      className="w-full block pointer-events-none"
                      draggable={false}
                    />

                    {/* Before (original) — clipped overlay */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img
                        src={transformationResult.original_image_url}
                        alt="Original room"
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                      />
                    </div>

                    {/* Divider line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                      style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    >
                      {/* Handle */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200">
                        <MoveHorizontal className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute top-3 left-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                      Before
                    </div>
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                      After
                    </div>
                  </div>

                  <div className="flex justify-center">
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
