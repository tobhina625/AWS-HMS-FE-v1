export interface IEnumItem {
  id: number;
  name: string;
}

export interface IBillTypeEnumResponse {
  billType: Array<Record<string, IEnumItem>>;
}
