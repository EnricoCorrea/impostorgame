import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
export class CreateRoomDto {
  @ApiProperty()
  users: User[];
}
