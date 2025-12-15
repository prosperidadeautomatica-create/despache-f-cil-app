import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { I18nModule, AcceptLanguageResolver, I18nJsonLoader } from 'nestjs-i18n';
import * as path from 'path';
import { existsSync } from 'fs';
import { AuthModule } from './auth/auth.module';
import { QuotesModule } from './quotes/quotes.module';
import { CarriersModule } from './carriers/carriers.module';
import { BillingModule } from './billing/billing.module';
import { FirestoreModule } from './firestore/firestore.module';
import { CommonModule } from './common/common.module';
import { LabelsModule } from './labels/labels.module';
import { configValidationSchema } from './config/config.schema';
import { AppController } from './app.controller';

// Determine the correct i18n path (works in both dev and production)
const getI18nPath = () => {
  const distPath = path.join(__dirname, '/i18n/');
  const srcPath = path.join(process.cwd(), 'src/i18n/');
  
  // In production/build, use dist path
  if (existsSync(distPath)) {
    return distPath;
  }
  // In development, use src path
  return srcPath;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      envFilePath: ['.env.local', '.env'],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'pt-BR', // Set Portuguese (Brazil) as default
      loader: I18nJsonLoader,
      loaderOptions: {
        path: getI18nPath(),
        watch: process.env.NODE_ENV !== 'production',
      },
      resolvers: [
        AcceptLanguageResolver,
      ],
    }),
    CommonModule,
    AuthModule,
    FirestoreModule,
    BillingModule,
    CarriersModule,
    QuotesModule,
    LabelsModule,
    // FrontendModule removed - using Express middleware in main.ts instead
  ],
  controllers: [AppController],
})
export class AppModule {}

