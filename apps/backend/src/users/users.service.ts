import { createClerkClient } from '@clerk/backend';
import { Inject, Injectable } from '@nestjs/common';
import { db, eq } from '@soouls/database/client';
import { users, waitlistUsers } from '@soouls/database/schema';
import { isWaitlistEmail, getWaitlistEntry } from '@soouls/database/waitlist-data';
import { MessagingService } from '../services/messaging.service';

@Injectable()
export class UsersService {
  constructor(private readonly messagingService: MessagingService) {}

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

    // 3. Check if this user is on the waitlist
    const onWaitlist = isWaitlistEmail(email);
    const waitlistEntry = onWaitlist ? getWaitlistEntry(email) : null;

    // 4. Create user in DB (with waitlist tag if applicable)
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId,
        email,
        name,
        phoneNumber: phoneNumber || waitlistEntry?.phoneNumber || null,
        isWaitlistUser: onWaitlist,
        accountStatus: onWaitlist ? 'beta' : 'active',
        transactionalWhatsappOptIn: Boolean(phoneNumber || waitlistEntry?.phoneNumber),
        marketingWhatsappOptIn: Boolean(phoneNumber || waitlistEntry?.phoneNumber),
      })
      .returning({ id: users.id });

    // 5. If on waitlist, update Clerk user metadata to reflect waitlist status
    if (onWaitlist) {
      // Mark the waitlist entry as claimed
      try {
        await db
          .update(waitlistUsers)
          .set({
            claimedAt: new Date(),
            claimedByUserId: newUser.id,
          })
          .where(eq(waitlistUsers.email, email.trim().toLowerCase()));
      } catch {
        // Waitlist entry might not exist in DB yet — that's OK
        console.warn(`[Users] Waitlist claim failed for ${email} — entry may not exist in DB yet`);
      }

      // Sync waitlist status to Clerk publicMetadata so frontend can read it
      try {
        await clerk.users.updateUser(clerkId, {
          publicMetadata: {
            isWaitlistUser: true,
            waitlistClaimedAt: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.error('[Users] Failed to sync waitlist metadata to Clerk:', err);
      }
    }

    await this.messagingService.sendWelcomeSequence(newUser.id);

    return newUser.id;
  }

  async updateUser(
    userId: string,
    data: {
      name?: string;
      themePreference?: string;
      mascot?: string;
      marketingEmailOptIn?: boolean;
      marketingWhatsappOptIn?: boolean;
      transactionalEmailOptIn?: boolean;
      transactionalWhatsappOptIn?: boolean;
    },
  ): Promise<void> {
    await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}
