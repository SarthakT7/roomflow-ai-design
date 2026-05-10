import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Clock, Download, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface Transformation {
  id: string;
  original_image_url: string;
  transformed_image_url: string | null;
  style_prompt: string;
  status: string;
  created_at: string;
}

const History = () => {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchTransformations();
  }, [user]);

  const fetchTransformations = async () => {
    const { data, error } = await supabase
      .from("transformations")
      .select("id, original_image_url, transformed_image_url, style_prompt, status, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Failed to load history",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTransformations(data || []);
    }
    setLoading(false);
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "transformed-room.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast({
        title: "Download failed",
        description: "Could not download the image.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
    };
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Transformations</h1>
            <p className="text-muted-foreground">View all your past room transformations</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your transformations...</p>
          </div>
        ) : transformations.length === 0 ? (
          <Card className="shadow-elegant">
            <CardContent className="text-center py-16">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No transformations yet</h3>
              <p className="text-muted-foreground mb-6">Transform your first room to see it here.</p>
              <Link to="/transform">
                <Button>Transform a Room</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {transformations.map((t) => (
              <Card key={t.id} className="shadow-elegant overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDate(t.created_at)}
                    </div>
                    {getStatusBadge(t.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Prompt:</span> {t.style_prompt}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Original</p>
                      <img
                        src={t.original_image_url}
                        alt="Original room"
                        className="w-full rounded-lg object-cover aspect-video"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Transformed</p>
                      {t.status === "completed" && t.transformed_image_url ? (
                        <>
                          <img
                            src={t.transformed_image_url}
                            alt="Transformed room"
                            className="w-full rounded-lg object-cover aspect-video"
                          />
                          <div className="mt-2 flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={() => handleDownload(t.transformed_image_url!)}
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          </div>
                        </>
                      ) : t.status === "failed" ? (
                        <div className="w-full rounded-lg bg-red-50 aspect-video flex items-center justify-center">
                          <p className="text-sm text-red-500">Transformation failed</p>
                        </div>
                      ) : (
                        <div className="w-full rounded-lg bg-muted aspect-video flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Processing...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
