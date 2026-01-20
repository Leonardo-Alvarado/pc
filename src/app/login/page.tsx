import { LoginForm } from '@/components/login-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">BookRegistry</CardTitle>
          <CardDescription>
            Sistema de Control de Entradas y Salidas
          </CardDescription>
        </CardHeader>
        <LoginForm />
      </Card>
    </main>
  );
}
