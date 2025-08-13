import {ClientType} from '../../../incidents/models/enums/client-type.enum';

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  parentClientId?: string;
  parentClientType?: ClientType;
}
