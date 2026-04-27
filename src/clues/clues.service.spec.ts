import { Test, TestingModule } from '@nestjs/testing';
import { CluesService } from './clues.service';

describe('CluesService', () => {
  let service: CluesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CluesService],
    }).compile();

    service = module.get<CluesService>(CluesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
