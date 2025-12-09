import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import QuoteList from '@/components/QuoteList';
import QuoteDetailModal from '@/components/QuoteDetailModal';
import { useQuotes, useQuote } from '@/hooks/useQuotes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { apiClient } from '@/services/api';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  // Use non-empty sentinel values for Select (Radix Select does not allow empty string for items)
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [carrierFilter, setCarrierFilter] = useState<string>('all');

  const { data: quotesData, isLoading, error } = useQuotes({
    status: statusFilter === 'all' ? undefined : statusFilter,
    carrier: carrierFilter === 'all' ? undefined : carrierFilter,
    enableRealtime: true, // Enable real-time updates on dashboard
  });

  const { data: selectedQuote } = useQuote(selectedQuoteId);

  const handleLogout = () => {
    apiClient.setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('clientId');
    navigate('/login');
  };

  const userName = localStorage.getItem('userName') || undefined;
  const quotes = quotesData?.quotes || [];

  // Calculate KPIs
  const totalQuotes = quotes.length;
  const avgPrice =
    quotes.length > 0
      ? quotes.reduce((sum, q) => sum + q.finalPrice, 0) / quotes.length
      : 0;
  const errorCount = quotes.filter((q) => q.status === 'error').length;

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={handleLogout} userName={userName} />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t('dashboard.title')}</h1>
            <p className="text-lg text-muted-foreground">
              {t('dashboard.description')}
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.totalQuotes')}
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalQuotes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.averagePrice')}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(avgPrice)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.errors')}</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {errorCount}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.filters')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t('dashboard.searchQuotes')}
                    className="pl-9"
                    aria-label={t('dashboard.searchQuotes')}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t('dashboard.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('dashboard.allStatuses')}</SelectItem>
                    <SelectItem value="success">{t('quoteItem.status.success')}</SelectItem>
                    <SelectItem value="pending">{t('quoteItem.status.pending')}</SelectItem>
                    <SelectItem value="error">{t('quoteItem.status.error')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={carrierFilter} onValueChange={setCarrierFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t('dashboard.allCarriers')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('dashboard.allCarriers')}</SelectItem>
                    <SelectItem value="FedEx">FedEx</SelectItem>
                    <SelectItem value="UPS">UPS</SelectItem>
                    <SelectItem value="DHL">DHL</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('all');
                    setCarrierFilter('all');
                  }}
                >
                  {t('common.clear')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quote List */}
          <QuoteList
            quotes={quotes}
            onSelect={setSelectedQuoteId}
            isLoading={isLoading}
            error={error ? t('dashboard.failedToLoad') : undefined}
          />
        </div>
      </main>

      {/* Detail Modal */}
      <QuoteDetailModal
        open={!!selectedQuoteId}
        onClose={() => setSelectedQuoteId(null)}
        quote={selectedQuote || null}
      />
    </div>
  );
}
