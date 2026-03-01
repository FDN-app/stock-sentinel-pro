import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="bg-card rounded-lg shadow-card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-3">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Stock Control</h1>
            <p className="text-sm text-muted-foreground mt-1">Ingresá a tu cuenta</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Iniciar Sesión</Button>
          </form>
          <div className="mt-6 p-3 rounded-md bg-muted">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo:</strong> admin@gmail.com / admin — staff@gmail.com / staff
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
