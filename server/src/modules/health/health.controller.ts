import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { SwaggerTag } from '#common/constants';
import { Public, SkipEnvelope } from '#common/decorators';

const HEAP_LIMIT_BYTES = 512 * 1024 * 1024;

@ApiTags(SwaggerTag.HEALTH)
@Controller('health')
@Public()
@SkipEnvelope()
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness: database and memory' })
  check() {
    return this.health.check([
      () => this.mongoose.pingCheck('mongodb', { timeout: 2000 }),
      () => this.memory.checkHeap('memoryHeap', HEAP_LIMIT_BYTES),
    ]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness: the process is up' })
  live() {
    return { status: 'ok' };
  }
}
