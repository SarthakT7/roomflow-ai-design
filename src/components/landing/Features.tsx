import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Palette, Download, Share, Zap, Shield } from "lucide-react";
import beforeAfter from "@/assets/before-after.jpg";

const features = [
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Simply drag and drop your room photo. Supports all common image formats.",
    color: "text-primary"
  },
  {
    icon: Palette,
    title: "Style Selection",
    description: "Choose from 20+ professional interior design styles and themes.",
    color: "text-sage"
  },
  {
    icon: Zap,
    title: "AI Processing",
    description: "Our advanced AI analyzes and transforms your room in under 30 seconds.",
    color: "text-primary-glow"
  },
  {
    icon: Download,
    title: "High-Quality Results",
    description: "Download stunning 4K resolution images of your transformed room.",
    color: "text-sage"
  },
  {
    icon: Share,
    title: "Share & Compare",
    description: "Share your designs and compare before/after transformations.",
    color: "text-primary"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your images are processed securely and never shared with third parties.",
    color: "text-muted-foreground"
  }
];

export const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Transform</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional-grade room transformation powered by cutting-edge AI technology. 
            No design skills required.
          </p>
        </div>

        {/* Before/After Showcase */}
        <div className="mb-20 animate-scale-in">
          <Card className="overflow-hidden shadow-elegant hover:shadow-glow transition-all duration-500">
            <img 
              src={beforeAfter} 
              alt="Before and after room transformation comparison" 
              className="w-full h-[500px] object-cover"
            />
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="p-8 hover:shadow-soft transition-all duration-300 animate-fade-in border-border/50 hover:border-primary/20"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-accent">
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-in">
          <Button variant="hero" size="lg" className="text-lg">
            <Upload className="w-5 h-5" />
            Try RoomFlow Free
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Transform 3 rooms free
          </p>
        </div>
      </div>
    </section>
  );
};