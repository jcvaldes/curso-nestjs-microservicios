import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class ValidationParamsPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException(
        `El valor del parametro ${metadata.data} debe ser informado`,
      );
    }  
    console.log(`value: ${value}, metadata: ${metadata.type}`);
    return value;
  }
}
