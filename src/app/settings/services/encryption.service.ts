import {AES, enc} from 'crypto-js';

export class EncryptionService {

  static readonly SECRET_KEY = '5a8d2d734a1352f8d113d22eabf2d1cb';

  public encrypt(data: string): string {
    return AES.encrypt(data, EncryptionService.SECRET_KEY).toString();
  }

  public decrypt(data: string): string {
    return AES.decrypt(data, EncryptionService.SECRET_KEY).toString(enc.Utf8);
  }
}
