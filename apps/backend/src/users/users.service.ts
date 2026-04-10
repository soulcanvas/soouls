import { createClerkClient } from '@clerk/backend';
import { Inject, Injectable } from '@nestjs/common';
import { db, eq } from '@soouls/database/client';
import { users } from '@soouls/database/schema';
import { MessagingService } from '../services/messaging.service';

@Injectable()
export class UsersService {
  constructor(@Inject(MessagingService) private readonly messagingService: MessagingService) {}

  async ensureUser(clerkId: string): Promise<string> {
    // 1. Check if user exists in DB
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existingUser) {
      return existingUser.id;
    }

    // 2. Fetch user details from Clerk
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not configured');
    }
    const clerk = createClerkClient({ secretKey });
    const clerkUser = await clerk.users.getUser(clerkId);

    // Get primary email
    const primaryEmailId = clerkUser.primaryEmailAddressId;
    const emailObj = clerkUser.emailAddresses.find((e) => e.id === primaryEmailId);
    const email = emailObj?.emailAddress || '';
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous';
    const primaryPhoneNumberId = clerkUser.primaryPhoneNumberId;
    const phoneObj = clerkUser.phoneNumbers.find((phone) => phone.id === primaryPhoneNumberId);
    const phoneNumber = phoneObj?.phoneNumber || null;

    if (!email) {
      throw new Error(`User ${clerkId} has no primary email address.`);
    }

    // 3. Create user in DB
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId,
        email,
        name,
        phoneNumber,
        transactionalWhatsappOptIn: Boolean(phoneNumber),
        marketingWhatsappOptIn: Boolean(phoneNumber),
      })
      .returning({ id: users.id });

    await this.messagingService.sendWelcomeSequence(newUser.id);

    return newUser.id;
  }
}
