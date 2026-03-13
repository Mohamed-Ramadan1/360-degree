import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsFutureDate', async: false })
export class IsFutureDate implements ValidatorConstraintInterface {
  validate(date: string) {
    return new Date(date) > new Date();
  }

  defaultMessage() {
    return 'Date must be in the future';
  }
}
