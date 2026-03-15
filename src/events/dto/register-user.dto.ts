import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ description: 'ID uživatele, který se hlásí na událost' })
  @IsString({ message: 'userId musí být text (string)' })
  @IsNotEmpty({ message: 'userId nesmí být prázdné' })
  userId: string;
}