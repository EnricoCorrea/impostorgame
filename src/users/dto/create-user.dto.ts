import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Felipe',
    description: 'Nome do usuário',
  })
  declare name: string;

  @ApiProperty({
    example: 'felipe@email.com',
    description: 'Email do usuário',
  })
  declare email: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha do usuário',
  })
  declare password: string;
}