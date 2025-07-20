import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import heroRoom from "@/assets/hero-room.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-warm-gray to-sage-muted opacity-90" />
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-sage/20 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="text-center lg:text-left animate-fade-in">
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              AI-Powered Design
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            Transform Your
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Room</span>
            <br />
            With AI Magic
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Upload a photo of your room and watch as our AI transforms it into stunning interior designs. 
            Get professional-quality room makeovers in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button variant="hero" size="lg" className="text-lg" asChild>
              <Link to="/transform">
                <Upload className="w-5 h-5" />
                Start Transforming
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="premium" size="lg" className="text-lg" asChild>
              <Link to="/examples">
                View Examples
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>No design experience needed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-sage rounded-full" />
              <span>Results in 30 seconds</span>
            </div>
          </div>
        </div>
        
        {/* Right Content - Hero Image */}
        <div className="relative animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="relative rounded-2xl overflow-hidden shadow-elegant hover:shadow-glow transition-all duration-500">
            <img 
              src={heroRoom} 
              alt="AI-transformed beautiful living room" 
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          </div>
        </div>
      </div>
    </section>
  );
};