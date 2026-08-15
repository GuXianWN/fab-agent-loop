import type { R as RPayload } from '../../../shared/types';

export interface RSuccess {
  data<T>(data: T): R<T>;
}

class RBuilder implements RSuccess {
  constructor(
    private readonly code: number,
    private readonly msg: string,
  ) {}

  data<T>(data: T): R<T> {
    return new R(this.code, data, this.msg);
  }
}

export class R<T = null> implements RPayload<T> {
  constructor(
    public readonly code: number,
    public readonly data: T,
    public readonly msg: string,
  ) {}

  static success(): RSuccess {
    return new RBuilder(0, 'success');
  }

  static error(code: number, msg: string): R<null> {
    return new R(code, null, msg);
  }
}
