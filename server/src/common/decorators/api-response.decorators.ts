import { HttpStatus, applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiSuccessResponseDto, ErrorResponseDto, PaginationMetaDto } from '#common/dto';

type Model = Type<unknown>;

interface EnvelopeOptions {
  status?: HttpStatus;
  description?: string;
  isArray?: boolean;
}

const envelopeSchema = (data: object, extra: Record<string, object> = {}) => ({
  allOf: [
    { $ref: getSchemaPath(ApiSuccessResponseDto) },
    { properties: { data, ...extra }, required: ['data', ...Object.keys(extra)] },
  ],
});

/** `{ success: true, data: Model }` (or `Model[]` with `isArray`). */
export const ApiEnvelope = (model: Model, options: EnvelopeOptions = {}) => {
  const ref = { $ref: getSchemaPath(model) };
  return applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto, model),
    ApiResponse({
      status: options.status ?? HttpStatus.OK,
      description: options.description,
      schema: envelopeSchema(options.isArray ? { type: 'array', items: ref } : ref),
    }),
  );
};

export const ApiOkEnvelope = (model: Model, options: Omit<EnvelopeOptions, 'status'> = {}) =>
  ApiEnvelope(model, { ...options, status: HttpStatus.OK });

export const ApiCreatedEnvelope = (model: Model, options: Omit<EnvelopeOptions, 'status'> = {}) =>
  ApiEnvelope(model, { ...options, status: HttpStatus.CREATED });

/** `{ success: true, data: Model[], meta: PaginationMeta }` */
export const ApiPaginatedResponse = (model: Model, description?: string) =>
  applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto, PaginationMetaDto, model),
    ApiResponse({
      status: HttpStatus.OK,
      description,
      schema: envelopeSchema(
        { type: 'array', items: { $ref: getSchemaPath(model) } },
        { meta: { $ref: getSchemaPath(PaginationMetaDto) } },
      ),
    }),
  );

const DEFAULT_ERROR_STATUSES = [
  HttpStatus.BAD_REQUEST,
  HttpStatus.UNAUTHORIZED,
  HttpStatus.FORBIDDEN,
  HttpStatus.NOT_FOUND,
  HttpStatus.CONFLICT,
  HttpStatus.INTERNAL_SERVER_ERROR,
];

/** Documents the shared error shape for the given statuses (defaults to the common set). */
export const ApiStandardResponses = (...statuses: HttpStatus[]) =>
  applyDecorators(
    ...(statuses.length ? statuses : DEFAULT_ERROR_STATUSES).map((status) =>
      ApiResponse({ status, type: ErrorResponseDto }),
    ),
  );
