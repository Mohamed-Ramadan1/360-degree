import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import { PaginatedResponseDto, PaginationDto } from './dto';

// common/helpers/paginate.helper.ts
export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  where: FindOptionsWhere<T>,
  dto: PaginationDto,
): Promise<PaginatedResponseDto<T>> {
  const page = dto.page ?? 1;
  const limit = dto.limit ?? 10;

  const [data, total] = await repository.findAndCount({
    where,
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
