export interface ILabTest {
  id: number;
  name: string;
  price: number;
}

export interface IAddLabTest {
  name: string;
  price: number;
}

export interface IUpdateLabTest extends IAddLabTest {
  id: number;
}
