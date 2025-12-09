import { Quote } from '@/types/quote';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface QuoteItemProps {
  quote: Quote;
  onClick: (quoteId: string) => void;
}

const STATUS_VARIANTS: Record<
  Quote['status'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'outline',
  processing: 'secondary',
  success: 'default',
  error: 'destructive',
};

export default function QuoteItem({ quote, onClick }: QuoteItemProps) {
  const { t, i18n } = useTranslation();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getStatusLabel = (status: Quote['status']) => {
    const statusMap: Record<string, string> = {
      success: t('quoteItem.status.success'),
      pending: t('quoteItem.status.pending'),
      error: t('quoteItem.status.error'),
      carrier_timeout: t('quoteItem.status.carrierTimeout'),
    };
    return statusMap[status] || status;
  };

  return (
    <Card
      className="cursor-pointer p-4 transition-all hover:shadow-md hover:border-primary/50"
      onClick={() => onClick(quote.quoteId)}
      role="button"
      tabIndex={0}
      aria-label={`View quote ${quote.quoteId} from ${quote.carrier}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(quote.quoteId);
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{quote.carrier}</h3>
              <Badge variant={STATUS_VARIANTS[quote.status]}>
                {getStatusLabel(quote.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{quote.service}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(quote.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(quote.finalPrice)}
          </p>
          {quote.negotiatedCost !== quote.finalPrice && (
            <p className="text-xs text-muted-foreground line-through">
              {formatCurrency(quote.negotiatedCost)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
