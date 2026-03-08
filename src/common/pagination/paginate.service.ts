import { Injectable } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { encodeCursor, decodeCursor } from './cursor.util';
import { PaginationDto, SortOrder } from './dto';
import { PaginatedResponseDto } from './dto';

export interface FilterConfig<T> {
  [key: string]: {
    value: any;
    operator?: 'eq' | 'like' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'any';
  };
}

export interface PaginationConfig<T extends ObjectLiteral> {
  alias: string;
  filters?: FilterConfig<T>;
}

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral & { id: string; createdAt: Date }>(
    queryBuilder: SelectQueryBuilder<T>,
    dto: PaginationDto,
    config: PaginationConfig<T>,
  ): Promise<PaginatedResponseDto<T>> {
    const limit = dto.limit ?? 20;
    const order = dto.order ?? SortOrder.DESC;
    const alias = config.alias;

    // Apply Filters
    if (config.filters) {
      Object.entries(config.filters).forEach(([field, filter], index) => {
        if (
          filter.value === undefined ||
          filter.value === null ||
          filter.value === ''
        )
          return;

        const param = `filter_${index}`;
        const col = `${alias}.${field}`;
        const operator = filter.operator ?? 'eq';

        switch (operator) {
          case 'like':
            queryBuilder.andWhere(`${col} ILIKE :${param}`, {
              [param]: `%${filter.value}%`,
            });
            break;
          case 'gt':
            queryBuilder.andWhere(`${col} > :${param}`, {
              [param]: filter.value,
            });
            break;
          case 'lt':
            queryBuilder.andWhere(`${col} < :${param}`, {
              [param]: filter.value,
            });
            break;
          case 'gte':
            queryBuilder.andWhere(`${col} >= :${param}`, {
              [param]: filter.value,
            });
            break;
          case 'lte':
            queryBuilder.andWhere(`${col} <= :${param}`, {
              [param]: filter.value,
            });
            break;
          case 'in':
            queryBuilder.andWhere(`${col} IN (:...${param})`, {
              [param]: filter.value,
            });
            break;
          case 'any':
            queryBuilder.andWhere(`:${param} = ANY(${col})`, {
              [param]: filter.value,
            });
            break;
          default: // eq
            queryBuilder.andWhere(`${col} = :${param}`, {
              [param]: filter.value,
            });
        }
      });
    }

    // Apply Sort
    queryBuilder.orderBy(`${alias}.id`, order);

    // Apply Cursor
    if (dto.cursor) {
      const id = decodeCursor(dto.cursor);
      const operator = order === SortOrder.DESC ? '<' : '>';

      queryBuilder.andWhere(`${alias}.id ${operator} :cursorId`, {
        cursorId: id,
      });
    }
    // Fetch limit check + 1 extra item to determine if there's a next page
    queryBuilder.take(limit + 1);

    const items = await queryBuilder.getMany();
    const hasNextPage = items.length > limit;
    if (hasNextPage) items.pop();

    const lastItem = items.at(-1);
    const nextCursor =
      hasNextPage && lastItem ? encodeCursor(lastItem.id) : null;

    return {
      data: items,
      meta: {
        hasNextPage,
        nextCursor,
        limit,
      },
    };
  }
}
