import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Felipe',
    description: 'Nome do usuário',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  declare name: string;

  @ApiProperty({
    example: 'felipe@email.com',
    description: 'Email do usuário',
  })
  @IsEmail()
  @MaxLength(150)
  declare email: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha do usuário',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  declare password: string;
}
