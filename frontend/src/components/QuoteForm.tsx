import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Info } from 'lucide-react';
import DebouncedPostalInput from './DebouncedPostalInput';
import { QuoteRequest } from '@/types/quote';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

const createQuoteSchema = (t: (key: string) => string) => z.object({
  originPostal: z
    .string()
    .regex(/^\d{8}$/, t('quote.postalCodeInvalid')),
  destinationPostal: z
    .string()
    .regex(/^\d{8}$/, t('quote.postalCodeInvalid')),
  weight: z.number().min(0.1, t('quote.weightMin')),
  length: z.number().min(1, t('quote.dimensionMin')),
  width: z.number().min(1, t('quote.dimensionMin')),
  height: z.number().min(1, t('quote.dimensionMin')),
  serviceOptions: z.array(z.string()).optional(),
  declaredValue: z.number().optional(),
});

interface QuoteFormProps {
  onSubmit: (payload: QuoteRequest) => Promise<void>;
  initialValues?: Partial<QuoteFormData>;
  disabled?: boolean;
}

export default function QuoteForm({
  onSubmit,
  initialValues,
  disabled = false,
}: QuoteFormProps) {
  const { t, i18n } = useTranslation();
  
  const quoteSchema = useMemo(
    () => createQuoteSchema(t),
    [t, i18n.language]
  );
  type QuoteFormData = z.infer<typeof quoteSchema>;
  
  const SERVICE_OPTIONS = useMemo(
    () => [
      { id: 'insurance', label: t('quote.insurance') },
      { id: 'signature', label: t('quote.signatureRequired') },
      { id: 'tracking', label: t('quote.realTimeTracking') },
    ],
    [t, i18n.language]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: initialValues || {
      originPostal: '',
      destinationPostal: '',
      weight: 1,
      length: 10,
      width: 10,
      height: 10,
    },
  });

  const originPostal = watch('originPostal') || '';
  const destinationPostal = watch('destinationPostal') || '';

  const onFormSubmit = async (data: QuoteFormData) => {
    try {
      const payload: QuoteRequest = {
        originPostal: data.originPostal,
        destinationPostal: data.destinationPostal,
        weight: data.weight,
        length: data.length,
        width: data.width,
        height: data.height,
        serviceOptions: data.serviceOptions,
        declaredValue: data.declaredValue,
      };
      await onSubmit(payload);
    } catch (error: any) {
      // Error handling is done at parent level
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <DebouncedPostalInput
          id="originPostal"
          label={t('quote.originPostalCode')}
          value={originPostal}
          onChange={(value) => setValue('originPostal', value)}
          error={errors.originPostal?.message}
          disabled={disabled || isSubmitting}
        />

        <DebouncedPostalInput
          id="destinationPostal"
          label={t('quote.destinationPostalCode')}
          value={destinationPostal}
          onChange={(value) => setValue('destinationPostal', value)}
          error={errors.destinationPostal?.message}
          disabled={disabled || isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="weight">{t('quote.weight')}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('quote.weightTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="weight"
          type="number"
          step="0.1"
          {...register('weight', { valueAsNumber: true })}
          disabled={disabled || isSubmitting}
          aria-invalid={!!errors.weight}
          aria-describedby={errors.weight ? 'weight-error' : undefined}
        />
        {errors.weight && (
          <p id="weight-error" className="text-sm text-destructive">
            {errors.weight.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="length">{t('quote.length')}</Label>
          <Input
            id="length"
            type="number"
            {...register('length', { valueAsNumber: true })}
            disabled={disabled || isSubmitting}
            aria-invalid={!!errors.length}
          />
          {errors.length && (
            <p className="text-sm text-destructive">{errors.length.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="width">{t('quote.width')}</Label>
          <Input
            id="width"
            type="number"
            {...register('width', { valueAsNumber: true })}
            disabled={disabled || isSubmitting}
            aria-invalid={!!errors.width}
          />
          {errors.width && (
            <p className="text-sm text-destructive">{errors.width.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">{t('quote.height')}</Label>
          <Input
            id="height"
            type="number"
            {...register('height', { valueAsNumber: true })}
            disabled={disabled || isSubmitting}
            aria-invalid={!!errors.height}
          />
          {errors.height && (
            <p className="text-sm text-destructive">{errors.height.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label>{t('quote.serviceOptions')}</Label>
        <div className="space-y-2">
          {SERVICE_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                {...register('serviceOptions')}
                value={option.id}
                disabled={disabled || isSubmitting}
              />
              <label
                htmlFor={option.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="declaredValue">{t('quote.declaredValue')}</Label>
        <Input
          id="declaredValue"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('declaredValue', { valueAsNumber: true })}
          disabled={disabled || isSubmitting}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={disabled || isSubmitting}
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('quote.calculating')}
          </>
        ) : (
          t('quote.getQuote')
        )}
      </Button>
    </form>
  );
}
