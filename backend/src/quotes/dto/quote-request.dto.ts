import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Matches,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuoteRequestDto {
  @ApiProperty({ example: '01310100', description: 'Origin postal code' })
  @IsString()
  @Matches(/^\d{8}$/, { message: 'Postal code must be 8 digits' })
  originPostal: string;

  @ApiProperty({ example: '04547000', description: 'Destination postal code' })
  @IsString()
  @Matches(/^\d{8}$/, { message: 'Postal code must be 8 digits' })
  destinationPostal: string;

  @ApiProperty({ example: 5.5, description: 'Package weight in kg' })
  @IsNumber()
  @Min(0.1)
  @Max(1000)
  weight: number;

  @ApiProperty({ example: 30, description: 'Package length in cm' })
  @IsNumber()
  @Min(1)
  @Max(200)
  length: number;

  @ApiProperty({ example: 20, description: 'Package width in cm' })
  @IsNumber()
  @Min(1)
  @Max(200)
  width: number;

  @ApiProperty({ example: 10, description: 'Package height in cm' })
  @IsNumber()
  @Min(1)
  @Max(200)
  height: number;

  @ApiProperty({
    example: ['insurance', 'tracking'],
    description: 'Optional service options',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceOptions?: string[];

  @ApiProperty({
    example: 1000,
    description: 'Declared value in currency units',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  declaredValue?: number;
}

