import { getModelToken } from '@nestjs/sequelize';
import { User } from './users/entities/user.entity';
import { Room } from './rooms/entities/room.entity';
import { RoomUser } from './rooms/entities/room-user.entity';
import * as bcrypt from 'bcrypt';

export async function seedDatabase(app: any) {
  const userModel = app.get(getModelToken(User));
  const roomModel = app.get(getModelToken(Room));
  const roomUserModel = app.get(getModelToken(RoomUser));

  const count = await userModel.count();
  if (count > 0) return;

  const hash = await bcrypt.hash('123456', 10);
  const users = await Promise.all([
    userModel.create({ name: 'Enrico', email: 'enrico@cefet-rj.br', password: hash }),
    userModel.create({ name: 'Felipe', email: 'felipe@cefet-rj.br', password: hash }),
    userModel.create({ name: 'Igreja', email: 'igreja@cefet-rj.br', password: hash }),
  ]);

  const room = await roomModel.create({
    name: 'Sala Principal',
    hostId: users[0].id,
    status: 'WAITING',
    maxUsers: 5,
  });

  for (const user of users) {
    await roomUserModel.create({ roomId: room.id, userId: user.id });
  }

  console.log(`[Seed] Sala ${room.id} criada com: ${users.map(u => `${u.name}(id=${u.id})`).join(', ')}`);
}
