import {ClientType} from '../../../incidents/models/enums/client-type.enum';

export interface UpdateContactDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  parentClientId?: string;
  parentClientType?: ClientType;
}
