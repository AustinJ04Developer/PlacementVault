import { User } from '../models/User.js';
import { ENV } from './env.js';

/**
 * Ensures the administrator account exists and credentials in MongoDB match ENV.ADMIN_EMAIL & ENV.ADMIN_PASSWORD.
 * This runs automatically whenever the server starts, eliminating manual database seeding for admin credentials.
 */
export const ensureAdminAccount = async (): Promise<void> => {
  try {
    const adminEmail = ENV.ADMIN_EMAIL;
    const adminPassword = ENV.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('[PlacementVault API] ADMIN_EMAIL or ADMIN_PASSWORD is empty in ENV.');
      return;
    }

    // Check if an admin exists with the configured email
    let user = await User.findOne({ email: adminEmail });

    if (user) {
      let needsSave = false;

      // Ensure user role is admin and active
      if (user.role !== 'admin') {
        user.role = 'admin';
        needsSave = true;
      }
      if (user.status !== 'active') {
        user.status = 'active';
        needsSave = true;
      }

      // Check if password has changed
      const isMatch = await user.comparePassword(adminPassword);
      if (!isMatch) {
        user.password = adminPassword; // Triggers pre-save hash in User model
        needsSave = true;
      }

      if (needsSave) {
        await user.save();
        console.log(`[PlacementVault API] Updated Admin account (${adminEmail}) credentials in MongoDB.`);
      } else {
        console.log(`[PlacementVault API] Admin account verified: ${adminEmail}`);
      }
      return;
    }

    // If no user matches adminEmail, check if a previous admin exists (e.g. default admin@placementvault.edu)
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`[PlacementVault API] Updating previous admin (${existingAdmin.email}) to configured ENV email (${adminEmail})...`);
      existingAdmin.email = adminEmail;
      existingAdmin.password = adminPassword;
      existingAdmin.status = 'active';
      await existingAdmin.save();
      console.log(`[PlacementVault API] Successfully migrated admin account to: ${adminEmail}`);
      return;
    }

    // Otherwise create a fresh Admin account
    console.log(`[PlacementVault API] Provisioning initial Administrator account (${adminEmail})...`);
    await User.create({
      name: 'Placement Officer (Administrator)',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      collegeName: 'Campus Training & Placement Cell',
      department: 'Training & Placement Administration',
      status: 'active',
      bio: 'Head of Campus Placements & Industry Relations. Responsible for repository governance, content moderation, and placement analytics.',
    });
    console.log(`[PlacementVault API] Admin account created successfully: ${adminEmail}`);
  } catch (error) {
    console.error('[PlacementVault API] Failed to initialize/sync administrator account:', error);
  }
};
