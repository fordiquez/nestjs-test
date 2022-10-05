import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    title: 'User name',
    description: 'User name',
    type: String,
    isArray: false,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
