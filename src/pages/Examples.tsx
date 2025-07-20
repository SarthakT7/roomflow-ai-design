import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Clock, Palette, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const examples = [
  {
    id: 1,
    title: "Modern Living Room",
    style: "Contemporary",
    beforeImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=400&fit=crop",
    rating: 4.9,
    transformTime: "24s",
    description: "Traditional living room transformed into a sleek modern space with clean lines and minimalist furniture."
  },
  {
    id: 2,
    title: "Cozy Bedroom",
    style: "Scandinavian", 
    beforeImage: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop",
    rating: 4.8,
    transformTime: "31s",
    description: "Small bedroom redesigned with Nordic aesthetics, featuring natural wood and cozy textiles."
  },
  {
    id: 6,
    title: "Bathroom Refresh",
    style: "Spa-like",
    beforeImage: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop",
    rating: 4.8,
    transformTime: "26s",
    description: "Basic bathroom transformed into a luxurious spa-like retreat with natural materials and calming colors."
  }
];

const styles = [
  "All Styles", "Modern", "Scandinavian", "Industrial", "Minimalist", 
  "Bohemian", "Traditional", "Contemporary", "Rustic", "Art Deco"
];

export default function Examples() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-gradient-accent">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <Badge variant="secondary" className="mb-4">
              <Eye className="w-4 h-4 mr-2" />
              Real Transformations
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Transform
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Inspiration</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover stunning room transformations created by our AI. See how real rooms were 
              reimagined with different design styles in seconds.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/transform">
                <Palette className="w-5 h-5" />
                Transform Your Room
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Style Filter */}
      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {styles.map((style) => (
              <Button
                key={style}
                variant={style === "All Styles" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {style}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {examples.map((example, index) => (
              <Card 
                key={example.id} 
                className="group overflow-hidden hover:shadow-elegant transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Before/After Images */}
                <div className="relative h-64 overflow-hidden">
                  <div className="grid grid-cols-2 h-full">
                    <div className="relative">
                      <img
                        src={example.beforeImage}
                        alt={`${example.title} before`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          Before
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <img
                        src={example.afterImage}
                        alt={`${example.title} after`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" className="text-xs">
                          After
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <Button variant="hero" size="sm">
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {example.style}
                    </Badge>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span>{example.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{example.transformTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {example.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {example.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-accent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Ready to Transform Your Space?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who have already transformed their rooms with AI.
              Upload your photo and see the magic happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg" asChild>
                <Link to="/transform">
                  <Palette className="w-5 h-5" />
                  Start Your Transformation
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="premium" size="lg" className="text-lg" asChild>
                <Link to="/auth">
                  Sign Up Free
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Transform 3 rooms free • Premium styles available
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}