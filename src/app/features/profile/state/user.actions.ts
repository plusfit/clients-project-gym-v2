export class LoadUser {
  static readonly type = '[User] Load';
  constructor(public readonly id: string) {}
}
