-- Create storage bucket for room images
INSERT INTO storage.buckets (id, name, public) VALUES ('room-images', 'room-images', true);

-- Create storage policies for room images
CREATE POLICY "Room images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'room-images');

CREATE POLICY "Users can upload room images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'room-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their room images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'room-images' AND auth.uid() IS NOT NULL);

-- Create transformations table
CREATE TABLE public.transformations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_image_url TEXT NOT NULL,
  transformed_image_url TEXT,
  style_prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  replicate_prediction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;

-- Create policies for transformations
CREATE POLICY "Users can view their own transformations" 
ON public.transformations 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own transformations" 
ON public.transformations 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own transformations" 
ON public.transformations 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_transformations_updated_at
BEFORE UPDATE ON public.transformations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();