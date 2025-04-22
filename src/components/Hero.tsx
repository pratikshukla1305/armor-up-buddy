
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Video, FileText, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;
      
      const elements = heroRef.current.querySelectorAll('.parallax');
      
      elements.forEach((el) => {
        const speed = Number((el as HTMLElement).dataset.speed) || 1;
        const moveX = x * speed * 50;
        const moveY = y * speed * 50;
        (el as HTMLElement).style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={heroRef}
      className="relative overflow-hidden min-h-screen flex items-center justify-center bg-stripe-blue-dark pt-16"
    >
      {/* Background gradient elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="parallax absolute -top-20 right-1/3 w-[600px] h-[600px] rounded-full bg-white opacity-10 blur-3xl" data-speed="0.3"></div>
        <div className="parallax absolute top-1/2 -left-20 w-[400px] h-[400px] rounded-full bg-stripe-blue opacity-20 blur-3xl" data-speed="0.5"></div>
        <div className="parallax absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500 opacity-10 blur-3xl" data-speed="0.4"></div>
      </div>
      
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm mb-6 animate-fade-in">
              <Shield className="h-4 w-4 text-white mr-2" />
              <span className="text-xs font-medium text-white">AI-Powered Crime Detection</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 animate-fade-up" style={{animationDelay: '0.1s'}}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Report crimes.</span><br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Analyze evidence.</span><br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Protect communities.</span>
            </h1>
            
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{animationDelay: '0.2s'}}>
              Shield combines AI technology to revolutionize crime reporting and evidence management, ensuring data integrity and sophisticated crime detection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{animationDelay: '0.3s'}}>
              <Button asChild size="stripe-lg" className="bg-white text-stripe-blue-dark hover:bg-white/90 group">
                <Link to="/get-started">
                  Get Started
                  <ArrowRight className="ml-1 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="stripe-lg" variant="outline" className="border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20">
                <Link to="/how-it-works">
                  Learn More
                  <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="mt-6 animate-fade-up" style={{animationDelay: '0.4s'}}>
              <Button asChild variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm">
                <Link to="/request-demo" className="flex items-center">
                  <Video className="mr-2 h-4 w-4" />
                  Request a Demo
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="relative mx-auto lg:mx-0 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-stripe-blue rounded-3xl blur-3xl opacity-10 transform -rotate-6"></div>
              <div className="parallax glass-card p-8 relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-xl" data-speed="0.8">
                {/* Police handshake image */}
                <div className="h-56 rounded-xl bg-stripe-gray overflow-hidden mb-6 shadow-inner">
                  <img 
                    src="/police-handshake.jpg" 
                    alt="Police officer handshaking with a citizen" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80';
                    }}
                  />
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Shield className="h-6 w-6 text-white mr-2" />
                    <span className="text-xl font-semibold text-white">Community Protection</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-sm text-white/80">
                    Working together to create safer communities through advanced technology and cooperation.
                  </div>
                  
                  <div className="flex justify-end">
                    <Button asChild size="sm" className="bg-white text-stripe-blue-dark hover:bg-gray-100 group">
                      <Link to="/help-us">
                        Join Our Effort
                        <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-6 -left-6 md:-top-10 md:-left-10 parallax" data-speed="1">
              <div className="glass-card p-3 shadow-lg transform -rotate-12 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl">
                <div className="text-xs font-semibold text-white">AI-Powered</div>
                <div className="text-[10px] text-white/70">Crime Detection</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <div className="text-sm text-white/70 mb-2">Scroll to explore</div>
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-1">
          <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
