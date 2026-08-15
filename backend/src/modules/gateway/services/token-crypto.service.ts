import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

@Injectable()
export class TokenCryptoService {
  private readonly algorithm = 'aes-256-gcm';

  constructor(private readonly configService: ConfigService) {}

  encrypt(value: string): string {
    const key = this.getKey();
    const iv = randomBytes(12);

    const cipher = createCipheriv(this.algorithm, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join('.');
  }

  decrypt(value: string): string {
    const [ivBase64, authTagBase64, encryptedBase64] = value.split('.');

    if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
      throw new Error('Invalid encrypted token format');
    }

    const key = this.getKey();

    const decipher = createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(ivBase64, 'base64'),
    );

    decipher.setAuthTag(Buffer.from(authTagBase64, 'base64'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedBase64, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  private getKey(): Buffer {
    const key = this.configService.getOrThrow<string>('TOKEN_ENCRYPTION_KEY');

    const buffer = Buffer.from(key, 'base64');

    if (buffer.length !== 32) {
      throw new Error('TOKEN_ENCRYPTION_KEY must contain exactly 32 bytes');
    }

    return buffer;
  }
}
