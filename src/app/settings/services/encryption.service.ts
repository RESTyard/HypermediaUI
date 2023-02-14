import {AES, enc} from 'crypto-js';

export class EncryptionService {

  static readonly SECRET_KEY = 'TEST_SECRET_KEY';

  public encrypt(data: string): string {
    return AES.encrypt(data, EncryptionService.SECRET_KEY).toString();
  }

  public decrypt(data: string): string {
    return AES.decrypt(data, EncryptionService.SECRET_KEY).toString(enc.Utf8);
  }
}
