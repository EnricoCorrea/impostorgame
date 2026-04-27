import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy/jwt.strategy';
import { AuthController } from './auth.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: 'segredo_cefetiano', // COISA IMPORTANTE AMIGOS N PODE ESQUECER DE TROCAR PRA USAR .ENV DPS!!!
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
