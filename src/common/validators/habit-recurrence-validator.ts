import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { RecurrenceType } from '../consts';

export function IsValidHabitRecurrence(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidHabitRecurrence',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const dto = args.object as any;

          switch (dto.recurrenceType) {
            case RecurrenceType.DAILY:
            case RecurrenceType.LAST_DAY_OF_MONTH:
              return !dto.days && !dto.dayOfMonth;

            case RecurrenceType.WEEKLY:
              return !dto.dayOfMonth;

            case RecurrenceType.MONTHLY:
              return !dto.days;

            default:
              return false;
          }
        },

        defaultMessage(args: ValidationArguments) {
          const dto = args.object as any;
          switch (dto.recurrenceType) {
            case RecurrenceType.DAILY:
              return 'daily habits must not have days or dayOfMonth';
            case RecurrenceType.LAST_DAY_OF_MONTH:
              return 'last_day_of_month habits must not have days or dayOfMonth';
            case RecurrenceType.WEEKLY:
              return 'weekly habits require days (1-6 days, 0-6) and must not have dayOfMonth';
            case RecurrenceType.MONTHLY:
              return 'monthly habits require dayOfMonth (1-31) and must not have days';
            default:
              return 'invalid recurrence configuration';
          }
        },
      },
    });
  };
}
