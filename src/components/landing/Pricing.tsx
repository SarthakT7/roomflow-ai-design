import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    credits: 10,
    price: 9,
    description: "Perfect for trying out RoomFlow",
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10",
    popular: false,
    features: [
      "10 room transformations",
      "All design styles included",
      "4K resolution downloads",
      "30-day access",
      "Email support"
    ]
  },
  {
    name: "Pro",
    credits: 50,
    price: 39,
    description: "Most popular choice for designers",
    icon: Zap,
    color: "text-sage",
    bgColor: "bg-sage/10",
    popular: true,
    features: [
      "50 room transformations",
      "All design styles included",
      "4K resolution downloads",
      "90-day access",
      "Priority email support",
      "Bulk download feature",
      "Style customization"
    ]
  },
  {
    name: "Enterprise",
    credits: 100,
    price: 69,
    description: "For professional design teams",
    icon: Crown,
    color: "text-primary-glow",
    bgColor: "bg-primary-glow/10",
    popular: false,
    features: [
      "100 room transformations",
      "All design styles included",
      "4K resolution downloads",
      "180-day access",
      "Priority phone support",
      "Bulk download feature",
      "Style customization",
      "API access",
      "Team collaboration tools"
    ]
  }
];

export const Pricing = () => {
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
            Choose the perfect plan for your room transformation needs. 
            All plans include our full suite of AI-powered design tools.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
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
                <div className={`inline-flex p-3 rounded-lg ${plan.bgColor} mb-4`}>
                  <plan.icon className={`w-8 h-8 ${plan.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/one-time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.credits} room transformations
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature) => (
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
                asChild
              >
                <Link to="/auth">
                  {plan.popular ? "Get Started" : "Choose Plan"}
                </Link>
              </Button>
            </Card>
          ))}
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
                Credits are valid for the duration specified in your plan (30-180 days). 
                Unused credits expire after the access period.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I upgrade my plan?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade to a higher tier at any time. 
                We'll prorate the difference based on your remaining credits.
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
                Yes! New users get 3 free transformations to try out RoomFlow 
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