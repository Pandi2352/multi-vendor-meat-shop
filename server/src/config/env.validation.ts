import { Transform, plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsEnum,
  IsIn,
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';
import { ToBoolean, ToInt } from '#common/transformers';

export enum NodeEnv {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;
const DURATION = /^\d+[smhd]$/;

/** Every environment variable the API reads. Defaults live here and nowhere else. */
export class EnvironmentVariables {
  // App
  @IsEnum(NodeEnv) NODE_ENV: NodeEnv = NodeEnv.DEVELOPMENT;
  @ToInt() @IsInt() @Min(1) @Max(65535) PORT = 4000;
  @IsString() APP_NAME = 'Meat Shop API';
  @IsString() API_PREFIX = 'api';
  @IsString() API_VERSION = '1';
  @IsString() CORS_ORIGINS = 'http://localhost:3000,http://localhost:3001';
  @ToInt() @IsInt() @Min(1000) REQUEST_TIMEOUT_MS = 15_000;
  @Matches(/^\d+(kb|mb)$/) BODY_LIMIT = '1mb';
  @ToBoolean() @IsBoolean() TRUST_PROXY = false;

  // Database
  @Matches(/^mongodb(\+srv)?:\/\//, {
    message: 'MONGODB_URI must be a mongodb:// or mongodb+srv:// URI',
  })
  MONGODB_URI!: string;
  @ToBoolean() @IsBoolean() MONGODB_AUTO_INDEX = true;
  @ToInt() @IsInt() @Min(1) MONGODB_MAX_POOL_SIZE = 20;
  @ToInt() @IsInt() @Min(500) MONGODB_SERVER_SELECTION_TIMEOUT_MS = 5000;

  // Auth
  @IsString() @MinLength(32) JWT_ACCESS_SECRET!: string;
  @IsString() @MinLength(32) JWT_REFRESH_SECRET!: string;
  @Matches(DURATION) JWT_ACCESS_TTL = '15m';
  @Matches(DURATION) JWT_REFRESH_TTL = '30d';
  @ToInt() @IsInt() @Min(4) @Max(8) OTP_LENGTH = 6;
  @ToInt() @IsInt() @Min(60) OTP_TTL_SECONDS = 300;
  @ToInt() @IsInt() @Min(1) OTP_MAX_ATTEMPTS = 5;
  @ToInt() @IsInt() @Min(10) OTP_RESEND_COOLDOWN_SECONDS = 60;

  // Super admin — created on boot if missing (the first portal account; everyone else is invited)
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsEmail()
  SUPER_ADMIN_EMAIL?: string;
  @IsString() SUPER_ADMIN_NAME = 'Super Admin';
  @IsString() SUPER_ADMIN_PASSWORD = 'Admin@12345';

  // Rate limiting
  @ToInt() @IsInt() @Min(1) THROTTLE_TTL_SECONDS = 60;
  @ToInt() @IsInt() @Min(1) THROTTLE_LIMIT = 120;

  // SMTP Mail — credentials have no defaults: they must come from .env, never from code.
  @IsString() SMTP_HOST = 'smtp.gmail.com';
  @ToInt() @IsInt() @Min(1) @Max(65535) SMTP_PORT = 587;
  @IsString() @MinLength(1) SMTP_USER!: string;
  @IsString() @MinLength(1) SMTP_PASS!: string;
  @IsString() @MinLength(3) MAIL_FROM!: string;

  // Swagger
  @ToBoolean() @IsBoolean() SWAGGER_ENABLED = true;
  @IsString() SWAGGER_PATH = 'docs';
  @ToBoolean() @IsBoolean() SWAGGER_WRITE_FILE = false;

  // Logging
  @IsIn(LOG_LEVELS) LOG_LEVEL: (typeof LOG_LEVELS)[number] = 'info';
  @ToBoolean() @IsBoolean() LOG_PRETTY = false;

  // Business defaults
  @ToInt() @IsInt() @Min(0) @Max(10_000) DEFAULT_COMMISSION_BPS = 1000;
  @ToInt() @IsInt() @Min(1) STOCK_RESERVATION_TTL_MINUTES = 15;
  @ToInt() @IsInt() @Min(5) DELIVERY_SLOT_MINUTES = 30;
  @ToInt() @IsInt() @Min(1) DEFAULT_SLOT_CAPACITY = 10;
  @ToInt() @IsInt() @Min(0) @Max(50) WEIGHT_VARIANCE_PERCENT = 10;
}

/** Validates env vars and applies defaults. Throws one error listing every problem. */
export const validateEnv = (raw: Record<string, unknown>): EnvironmentVariables => {
  const env = plainToInstance(EnvironmentVariables, raw, { exposeDefaultValues: true });
  const errors = validateSync(env, { skipMissingProperties: false, whitelist: false });
  if (errors.length) {
    const lines = errors.flatMap((e) => Object.values(e.constraints ?? {}).map((m) => `  - ${m}`));
    throw new Error(`Invalid environment configuration:\n${lines.join('\n')}`);
  }
  return env;
};

let cachedEnv: EnvironmentVariables | undefined;

/** Validated env, read once. Only config namespace factories should call this. */
export const getEnv = (): EnvironmentVariables => (cachedEnv ??= validateEnv(process.env));
