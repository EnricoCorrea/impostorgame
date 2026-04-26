import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
constructor(
  @InjectModel(User)
  private userModel: typeof User,
) {}

async create(createUserDto: CreateUserDto) {
  return this.userModel.create({ ...createUserDto });
}

async findAll() {
  return this.userModel.findAll();
}

async findOne(id: number) {
  const user = await this.userModel.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

async update(id: number, updateUserDto: UpdateUserDto) {
  const user = await this.userModel.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  await user.update({ ...updateUserDto });

  return user;
}

async remove(id: number) {
  const user = await this.userModel.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  await user.destroy();

  return user;
}
}
