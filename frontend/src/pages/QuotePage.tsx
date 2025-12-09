import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import QuoteForm from '@/components/QuoteForm';
import PriceCard from '@/components/PriceCard';
import { useSubmitQuote } from '@/hooks/useQuotes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Quote } from '@/types/quote';
import { apiClient } from '@/services/api';
import { useTranslation } from 'react-i18next';

export default function QuotePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [successQuote, setSuccessQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submitQuote = useSubmitQuote();

  const handleLogout = () => {
    apiClient.setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('clientId');
    navigate('/login');
  };

  const handleSubmit = async (payload: any) => {
    setError(null);
    setSuccessQuote(null);
    try {
      const result = await submitQuote.mutateAsync(payload);
      setSuccessQuote(result);
    } catch (err: any) {
      const errorMessage = err.message || err.code || t('quote.failedToGenerate');
      const correlationId = err.correlationId;
      setError(
        correlationId
          ? `${errorMessage} (${t('quote.correlationId')}: ${correlationId})`
          : errorMessage
      );
    }
  };

  const userName = localStorage.getItem('userName') || undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={handleLogout} userName={userName} />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">{t('quote.getShippingQuote')}</h1>
            <p className="text-lg text-muted-foreground">
              {t('quote.quoteDescription')}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setSuccessQuote(null);
                      if (submitQuote.error) {
                        submitQuote.reset();
                      }
                    }}
                    className="mt-2"
                  >
                    {t('common.retry')}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {successQuote && (
            <Alert className="border-success bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success-foreground">
                {t('quote.quoteGenerated')} {t('quote.correlationId')}: {successQuote.correlationId}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-8 md:grid-cols-1">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t('quote.shipmentInformation')}</CardTitle>
                <CardDescription>
                  {t('quote.shipmentDetails')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuoteForm onSubmit={handleSubmit} />
              </CardContent>
            </Card>

            {successQuote && (
              <div className="md:col-span-1">
                <PriceCard
                  negotiatedCost={successQuote.negotiatedCost}
                  markupPercent={15}
                  fixedFee={5}
                  finalPrice={successQuote.finalPrice}
                  currency="BRL"
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
