import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ChatType } from '../types/chat.types';
import { Types } from 'mongoose';
import { Transform } from 'class-transformer';

@ValidatorConstraint({ name: 'isObjectId', async: false })
export class IsObjectIdConstraint implements ValidatorConstraintInterface {
  public validate(value: any): boolean {
    return Types.ObjectId.isValid(value);
  }

  public defaultMessage(): string {
    return 'Invalid MongoDB ObjectId';
  }
}

export class NewChatDto {
  @IsNotEmpty()
  @IsEnum(ChatType)
  type: ChatType;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @Validate(IsObjectIdConstraint, {
    each: true,
    message: 'each value in members must be a mongodb id',
  })
  @Transform(({ value }) =>
    value.map(
      (id: string) => Types.ObjectId.isValid(id) && new Types.ObjectId(id),
    ),
  )
  members: Array<Types.ObjectId>;

  @IsString()
  @IsOptional()
  chatName?: string;

  @IsString()
  @IsOptional()
  chatIcon?: string;

  @IsArray()
  @IsOptional()
  @Validate(IsObjectIdConstraint, {
    each: true,
    message: 'each value in admins must be a mongodb id',
  })
  @Transform(({ value }) =>
    value.map(
      (id: string) => Types.ObjectId.isValid(id) && new Types.ObjectId(id),
    ),
  )
  admins?: Array<Types.ObjectId>;
}
