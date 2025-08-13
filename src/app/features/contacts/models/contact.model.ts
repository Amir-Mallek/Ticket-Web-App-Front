import {ClientType} from '../../incidents/models/enums/client-type.enum';

export interface Contact {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  parentClientId?: string;
  parentClientType?: ClientType;
}
