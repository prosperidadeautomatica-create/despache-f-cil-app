import { ApiProperty } from '@nestjs/swagger';

export class QuoteResponseDto {
  @ApiProperty()
  quoteId: string;

  @ApiProperty()
  carrier: string;

  @ApiProperty()
  service: string;

  @ApiProperty()
  negotiatedCost: number;

  @ApiProperty()
  finalPrice: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  correlationId: string;

  @ApiProperty({ required: false })
  estimatedDelivery?: string;

  @ApiProperty()
  originPostal: string;

  @ApiProperty()
  destinationPostal: string;

  @ApiProperty()
  weight: number;

  @ApiProperty({ required: false })
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  @ApiProperty({ required: false })
  serviceOptions?: string[];

  @ApiProperty({ required: false })
  declaredValue?: number;
}

