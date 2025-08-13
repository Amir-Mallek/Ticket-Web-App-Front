import {Priority} from '../enums/priority.enum';
import {Status} from '../enums/status.enum';

export interface UpdateIncidentDto {
  agentId?: string;
  priority?: Priority;
  status?: Status;
  description?: string;
}
