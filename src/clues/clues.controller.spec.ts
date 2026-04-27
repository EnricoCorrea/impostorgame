import { Test, TestingModule } from '@nestjs/testing';
import { CluesController } from './clues.controller';
import { CluesService } from './clues.service';

describe('CluesController', () => {
  let controller: CluesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CluesController],
      providers: [CluesService],
    }).compile();

    controller = module.get<CluesController>(CluesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
