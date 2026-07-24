import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  readonly uploadDir = join(process.cwd(), 'uploads', 'designs');

  constructor() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  buildFilename(originalName: string) {
    const ext = (originalName.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${Date.now()}-${randomUUID()}.${ext || 'jpg'}`;
  }

  publicUrl(filename: string) {
    return `/uploads/designs/${filename}`;
  }
}
