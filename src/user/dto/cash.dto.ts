import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CashDto {
  @ApiProperty({
    title: 'Cash',
    type: Number,
    isArray: false,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  readonly cash: number;
}
