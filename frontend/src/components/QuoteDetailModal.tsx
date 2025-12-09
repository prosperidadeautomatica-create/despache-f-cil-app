import { useState, useEffect, useRef } from 'react';
import { Quote } from '@/types/quote';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Calendar,
  Package,
  MapPin,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PriceCard from './PriceCard';
import { useTranslation } from 'react-i18next';

interface QuoteDetailModalProps {
  open: boolean;
  onClose: () => void;
  quote: Quote | null;
  onRegenerate?: () => Promise<void>;
}

export default function QuoteDetailModal({
  open,
  onClose,
  quote,
  onRegenerate,
}: QuoteDetailModalProps) {
  const { t, i18n } = useTranslation();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [debugExpanded, setDebugExpanded] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [open]);

  if (!quote) return null;

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      await onRegenerate();
      toast({
        title: t('quoteDetail.quoteRegenerated'),
        description: t('quoteDetail.regeneratedDescription'),
      });
    } catch (error) {
      toast({
        title: t('quoteDetail.failedToRegenerate'),
        description: t('quoteDetail.failedToRegenerateDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('common.copied'),
      description: t('quote.correlationIdCopied'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="quote-detail-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('quoteDetail.title')}</span>
            <Badge>{quote.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div id="quote-detail-description" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{t('quoteDetail.carrier')}</span>
              </div>
              <p className="text-lg font-semibold">{quote.carrier}</p>
              <p className="text-sm text-muted-foreground">{quote.service}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{t('quoteDetail.created')}</span>
              </div>
              <p className="text-lg font-semibold">
                {new Date(quote.createdAt).toLocaleString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US')}
              </p>
              {quote.estimatedDelivery && (
                <p className="text-sm text-muted-foreground">
                  {t('quoteDetail.estimatedDelivery')}: {new Date(quote.estimatedDelivery).toLocaleDateString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US')}
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              {t('quoteDetail.shipmentDetails')}
            </div>
            <div className="grid gap-3 rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('quoteDetail.origin')}</span>
                <span className="font-medium">{quote.originPostal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('quoteDetail.destination')}</span>
                <span className="font-medium">{quote.destinationPostal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('quote.weight')}:</span>
                <span className="font-medium">{quote.weight} kg</span>
              </div>
              {quote.dimensions && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('quoteDetail.dimensions')}</span>
                  <span className="font-medium">
                    {quote.dimensions.length} × {quote.dimensions.width} ×{' '}
                    {quote.dimensions.height} cm
                  </span>
                </div>
              )}
            </div>
          </div>

          <PriceCard
            negotiatedCost={quote.negotiatedCost}
            markupPercent={15}
            fixedFee={5}
            finalPrice={quote.finalPrice}
            currency="BRL"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('quote.correlationId')}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(quote.correlationId)}
                className="gap-2"
              >
                <Copy className="h-3 w-3" />
                {t('common.copy')}
              </Button>
            </div>
            <div className="rounded-md bg-muted px-3 py-2 font-mono text-xs">
              {quote.correlationId}
            </div>
          </div>

          {quote.carrierResponse && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDebugExpanded(!debugExpanded)}
                className="w-full justify-between"
              >
                <span className="text-sm font-medium">{t('quoteDetail.debugInformation')}</span>
                {debugExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {debugExpanded && (
                <pre className="max-h-60 overflow-auto rounded-md bg-muted p-3 text-xs">
                  {JSON.stringify(quote.carrierResponse, null, 2)}
                </pre>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {onRegenerate && (
              <Button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex-1 gap-2"
                variant="outline"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {t('quoteDetail.regenerating')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {t('quoteDetail.regenerateQuote')}
                  </>
                )}
              </Button>
            )}
            <Button
              ref={closeButtonRef}
              onClick={onClose}
              variant="default"
              className="flex-1"
            >
              {t('common.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
