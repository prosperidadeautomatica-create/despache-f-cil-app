import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PriceBreakdown } from '@/types/quote';

interface PriceCardProps extends PriceBreakdown {
  detailsOpen?: boolean;
}

export default function PriceCard({
  negotiatedCost,
  markupPercent,
  fixedFee,
  finalPrice,
  currency,
  detailsOpen = true,
}: PriceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const markupAmount = negotiatedCost * (markupPercent / 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Price Breakdown
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Final Price = (Negotiated Cost × Markup %) + Fixed Fee
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {detailsOpen && (
          <div
            className="space-y-3 border-b border-border pb-3"
            role="table"
            aria-label="Price breakdown details"
          >
            <div
              className="flex justify-between text-sm"
              role="row"
            >
              <span className="text-muted-foreground" role="cell">
                Negotiated Cost
              </span>
              <span className="font-medium" role="cell">
                {formatCurrency(negotiatedCost)}
              </span>
            </div>
            <div
              className="flex justify-between text-sm"
              role="row"
            >
              <span className="text-muted-foreground" role="cell">
                Markup ({markupPercent}%)
              </span>
              <span className="font-medium" role="cell">
                {formatCurrency(markupAmount)}
              </span>
            </div>
            <div
              className="flex justify-between text-sm"
              role="row"
            >
              <span className="text-muted-foreground" role="cell">
                Fixed Fee
              </span>
              <span className="font-medium" role="cell">
                {formatCurrency(fixedFee)}
              </span>
            </div>
          </div>
        )}
        <div
          className="mt-3 flex justify-between text-lg font-bold"
          role="row"
        >
          <span role="cell">Final Price</span>
          <span className="text-primary" role="cell">
            {formatCurrency(finalPrice)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
