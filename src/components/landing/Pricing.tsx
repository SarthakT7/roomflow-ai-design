import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBilling } from "@/hooks/useBilling";
import { startRazorpayCheckout } from "@/lib/razorpay";
import { useToast } from "@/hooks/use-toast";

export const Pricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { plans, freeTransformations, refresh } = useBilling();
  const icons = [Sparkles, Zap, Crown];
  const colors = [
    { color: "text-primary", bgColor: "bg-primary/10" },
    { color: "text-sage", bgColor: "bg-sage/10" },
    { color: "text-primary-glow", bgColor: "bg-primary-glow/10" },
  ];

  const handleCheckout = async (plan: (typeof plans)[number]) => {
    if (!user) return;

    try {
      await startRazorpayCheckout({
        plan,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
      });
      await refresh();
      toast({
        title: "Payment successful",
        description: `${plan.credits} transformations were added to your account.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment could not be completed.";
      toast({
        title: "Payment failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Simple, Transparent
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start with {freeTransformations} free transformations, then add small credit packs whenever you need more.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
              const Icon = icons[index] || Sparkles;
              const palette = colors[index] || colors[0];
              const features = [
                `${plan.credits} room transformations`,
                "All design styles included",
                "High-resolution downloads",
                "Credits stay on your account",
                "Secure Razorpay checkout",
              ];

              return (
            <Card 
              key={plan.name}
              className={`relative p-8 hover:shadow-elegant transition-all duration-300 animate-fade-in border-border/50 hover:border-primary/20 ${
                plan.popular ? 'ring-2 ring-primary shadow-glow' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground border-0">
                  Most Popular
                </Badge>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex p-3 rounded-lg ${palette.bgColor} mb-4`}>
                  <Icon className={`w-8 h-8 ${palette.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-foreground">INR {plan.amount}</span>
                    <span className="text-muted-foreground">/one-time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.credits} room transformations
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-primary/10">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button 
                variant={plan.popular ? "hero" : "default"} 
                className="w-full"
                asChild={!user}
                onClick={user ? () => handleCheckout(plan) : undefined}
              >
                {user ? (
                  plan.popular ? "Buy Credits" : "Choose Plan"
                ) : (
                  <Link to="/auth">
                    {plan.popular ? "Get Started" : "Choose Plan"}
                  </Link>
                )}
              </Button>
            </Card>
              );
          })}
        </div>

        {/* FAQ Section */}
        <div className="text-center animate-fade-in">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How long do credits last?</h4>
              <p className="text-sm text-muted-foreground">
                Credits stay on your account until you use them.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I buy more later?</h4>
              <p className="text-sm text-muted-foreground">
                Yes. You can add another credit pack whenever your balance runs low.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">What image formats are supported?</h4>
              <p className="text-sm text-muted-foreground">
                We support JPG, PNG, and WebP formats. 
                Images should be at least 512x512 pixels for best results.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Is there a free trial?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! New users get {freeTransformations} free transformations to try out RoomFlow 
                before choosing a plan.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <Button variant="ghost" className="text-primary hover:text-primary-glow">
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
}; 
