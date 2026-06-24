import GenericService from '../g-service';
import type { IBillTypeEnumResponse } from './Enum.dto';

class EnumService {
  private readonly _genericService = new GenericService();

  async getBillTypes(): Promise<IBillTypeEnumResponse> {
    const response = await this._genericService.get('api/enums');
    return response as IBillTypeEnumResponse;
  }
}

export default EnumService;
