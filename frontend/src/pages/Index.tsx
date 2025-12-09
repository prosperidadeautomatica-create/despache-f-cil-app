import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, TrendingUp, Shield, Zap } from 'lucide-react';
import { apiClient } from '@/services/api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Index() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    apiClient.setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('clientId');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const features = [
    {
      icon: Zap,
      title: t('home.features.instantQuotes.title'),
      description: t('home.features.instantQuotes.description'),
    },
    {
      icon: TrendingUp,
      title: t('home.features.priceTransparency.title'),
      description: t('home.features.priceTransparency.description'),
    },
    {
      icon: Shield,
      title: t('home.features.reliableTracking.title'),
      description: t('home.features.reliableTracking.description'),
    },
    {
      icon: Package,
      title: t('home.features.multiCarrier.title'),
      description: t('home.features.multiCarrier.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Package className="h-8 w-8 text-primary" />
            {t('common.appName')}
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          {!isAuthenticated && (
              <Button onClick={() => navigate('/login')}>{t('auth.signIn')}</Button>
          )}
          {isAuthenticated && (
              <Button onClick={handleLogout}>{t('auth.signOut')}</Button>
          )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl space-y-16 text-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight md:text-6xl">
              {t('home.title')}
              <br />
              <span className="text-primary">{t('home.subtitle')}</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t('home.description')}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {!isAuthenticated && (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate('/signup')}
                    className="text-lg px-8"
                  >
                    {t('home.getStarted')}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="text-lg px-8"
                  >
                    {t('auth.signIn')}
                  </Button>
                </>
              )}
              {isAuthenticated && (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate('/quote')}
                    className="text-lg px-8"
                  >
                    {t('navigation.newQuote')}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="text-lg px-8"
                  >
                    {t('navigation.dashboard')}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <CardContent className="p-6 text-left">
                  <feature.icon className="mb-4 h-10 w-10 text-primary" />
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-8">
            <h2 className="mb-4 text-2xl font-bold">{t('home.readyToStreamline')}</h2>
            <p className="mb-6 text-muted-foreground">
              {t('home.joinBusinesses')}
            </p>
            {!isAuthenticated && (
              <Button size="lg" onClick={() => navigate('/signup')}>
                {t('home.startNow')}
              </Button>
            )}
            {isAuthenticated && (
              <Button size="lg" onClick={() => navigate('/quote')}>
                {t('navigation.newQuote')}
              </Button> 
            )}
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>{t('home.footer')}</p>
      </footer>
    </div>
  );
}
