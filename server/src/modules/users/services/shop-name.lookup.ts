import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { CollectionName } from '#database';

/**
 * A shop's display name for invitation emails and the accept page. Reads the collection directly so
 * the users module doesn't depend on the shops module (which already depends on users).
 */
@Injectable()
export class ShopNameLookup {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async nameOf(shopId: string | null | undefined): Promise<string | undefined> {
    if (!shopId) return undefined;
    const shop = await this.connection
      .collection<{ _id: string; name: string }>(CollectionName.SHOPS)
      .findOne({ _id: shopId }, { projection: { name: 1 } });
    return shop?.name;
  }
}
