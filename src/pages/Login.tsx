import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate slight artificial delay for premium feel
    setTimeout(async () => {
      if (await login(email, password)) {
        navigate('/');
      } else {
        setError('Credenciales incorrectas');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-secondary relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/30 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

      <div className="w-full max-w-md animate-fade-in relative z-10 p-4">
        <div className="glass-card rounded-2xl p-8 sm:p-10 relative overflow-hidden">

          <div className="relative flex flex-col items-center mb-10">
            <div className="h-16 w-16 rounded-2xl shadow-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 animate-float" style={{ animationDuration: '4s' }}>
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Stock Sentinel Pro</h1>
            <p className="text-sm text-muted-foreground mt-2 text-center">Software avanzado de gestión de inventario</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <Label htmlFor="email" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@stocksentinel.local"
                className="h-12 bg-background/50 border-white/10 dark:border-white/5 focus:bg-background transition-all"
                required
              />
            </div>

            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Contraseña</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                className="h-12 bg-background/50 border-white/10 dark:border-white/5 focus:bg-background transition-all"
                required
              />
            </div>

            {error && <p className="text-sm text-destructive font-medium animate-fade-in text-center p-2 rounded bg-destructive/10">{error}</p>}

            <Button type="submit" className="w-full h-12 text-md font-semibold mt-4 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Conectando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Iniciar Sesión Segura
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-background/40 border border-border/50 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground text-center flex flex-col gap-1">
              <strong className="text-foreground">Cuentas de demostración:</strong>
              <span>Admin: admin@stocksentinel.local / adminpassword</span>
              <span>Staff: staff@stocksentinel.local / staffpassword</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
