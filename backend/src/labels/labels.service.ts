import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FirestoreService } from '../firestore/firestore.service';
import { Quote } from '../quotes/interfaces/quote.interface';

@Injectable()
export class LabelsService {
  private readonly logger = new Logger(LabelsService.name);

  constructor(private firestoreService: FirestoreService) {}

  /**
   * Generate a shipping label stub for MVP
   * In production, this would integrate with carrier label generation API
   */
  async generateLabel(
    clientId: string,
    quoteId: string,
    correlationId: string,
  ): Promise<{ labelUrl: string; pdfBase64?: string; labelId: string }> {
    // Verify quote exists and belongs to client
    const quote = await this.firestoreService.getQuote(clientId, quoteId);
    if (!quote) {
      throw new HttpException('Quote not found', HttpStatus.NOT_FOUND);
    }

    // Check if quote is in a valid state for label generation
    if (quote.status !== 'success') {
      throw new HttpException(
        `Cannot generate label for quote with status: ${quote.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate a stub label ID
    const labelId = `LABEL-${quoteId.substring(0, 8).toUpperCase()}-${Date.now()}`;

    // For MVP: Generate a stub PDF content (base64 encoded)
    // In production, this would call the carrier's label generation API
    const stubPdfContent = this.generateStubPdf(quote, labelId);

    // Update quote status to indicate label was generated
    await this.firestoreService.updateQuote(clientId, quoteId, {
      labelGenerated: true,
      labelId,
      labelGeneratedAt: new Date().toISOString(),
    });

    this.logger.log(
      `[${correlationId}] Label generated for quote ${quoteId}: ${labelId}`,
    );

    // Return label URL (stub) and base64 PDF content
    return {
      labelId,
      labelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/labels/${labelId}`,
      pdfBase64: stubPdfContent,
    };
  }

  /**
   * Generate a stub PDF content for MVP
   * In production, this would be replaced with actual carrier label generation
   */
  private generateStubPdf(quote: Quote, labelId: string): string {
    // Create a simple stub PDF content
    // This is a minimal PDF structure for demonstration
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
100 700 Td
(Shipping Label) Tj
0 -20 Td
(Label ID: ${labelId}) Tj
0 -20 Td
(Quote ID: ${quote.quoteId}) Tj
0 -20 Td
(From: ${quote.originPostal}) Tj
0 -20 Td
(To: ${quote.destinationPostal}) Tj
0 -20 Td
(Weight: ${quote.weight} kg) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000316 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
516
%%EOF`;

    // Convert to base64
    return Buffer.from(pdfContent).toString('base64');
  }
}

