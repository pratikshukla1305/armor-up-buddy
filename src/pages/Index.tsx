
import { ShieldDashboard } from "@/components/ShieldDashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-shield-dark/95">
      <div className="container py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-shield-dark dark:text-white">
            Armor Up Buddy
          </h1>
          <p className="text-muted-foreground">
            Your personal shield protection system
          </p>
        </header>
        
        <main>
          <ShieldDashboard />
        </main>
        
        <footer className="mt-16 py-6 text-center text-sm text-muted-foreground border-t">
          <p>Armor Up Buddy - Shield Protection System &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
