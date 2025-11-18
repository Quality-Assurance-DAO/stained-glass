import prisma from '../src/config/database';
import { createHash } from 'crypto';

async function seedTestData() {
  console.log('🌱 Seeding test data for Phase 4+ testing...\n');

  try {
    // Check if data already exists
    const existingChurches = await prisma.church.count();
    if (existingChurches > 0) {
      console.log(`⚠️  Found ${existingChurches} existing churches in database.`);
      console.log('   Skipping seed - data already exists.');
      console.log('   Run reset-db.sh first if you want to start fresh.\n');
      return;
    }

    // Create test churches with windows
    const church1 = await prisma.church.create({
      data: {
        name: "St. Mary's Church",
        county: "Yorkshire",
        town: "York",
        latitude: 53.9600,
        longitude: -1.0800,
        floor_plan_url: "/floorplans/st-marys.svg",
        windows: {
          create: [
            {
              location_description: "North Window",
              coordinates_on_plan: { x: 80, y: 200, width: 30, height: 80 },
            },
            {
              location_description: "South Window",
              coordinates_on_plan: { x: 80, y: 400, width: 30, height: 80 },
            },
            {
              location_description: "East Window",
              coordinates_on_plan: { x: 500, y: 50, width: 80, height: 30 },
            },
          ],
        },
      },
    });

    const church2 = await prisma.church.create({
      data: {
        name: "St. Peter's Cathedral",
        county: "Yorkshire",
        town: "Leeds",
        latitude: 53.8008,
        longitude: -1.5491,
        floor_plan_url: "/floorplans/st-peters.svg",
        windows: {
          create: [
            {
              location_description: "Rose Window",
              coordinates_on_plan: { x: 360, y: 80, width: 80, height: 80 },
            },
            {
              location_description: "Chancel Window",
              coordinates_on_plan: { x: 580, y: 250, width: 30, height: 100 },
            },
          ],
        },
      },
    });

    const church3 = await prisma.church.create({
      data: {
        name: "All Saints Church",
        county: "Kent",
        town: "Canterbury",
        latitude: 51.2794,
        longitude: 1.0800,
        floor_plan_url: "/floorplans/all-saints.svg",
        windows: {
          create: [
            {
              location_description: "West Window",
              coordinates_on_plan: { x: 50, y: 100, width: 30, height: 80 },
            },
          ],
        },
      },
    });

    // Create test users
    const user1 = await prisma.user.create({
      data: {
        app_id: 'test-user-001',
        contribution_count: 0,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        app_id: 'test-user-002',
        contribution_count: 0,
      },
    });

    console.log('✅ Created test users');

    // Helper function to generate image hash
    const generateImageHash = (seed: string): string => {
      return createHash('sha256').update(`stained-glass-sample-${seed}`).digest('hex');
    };

    // Create sample photo submissions for St. Mary's Church
    const stMarysWindows = await prisma.window.findMany({
      where: { church_id: church1.id },
    });

    const stMarysSubmissions = [];
    if (stMarysWindows.length > 0) {
      // North Window - 2 photos
      const northWindow = stMarysWindows.find((w) => w.location_description === 'North Window');
      if (northWindow) {
        stMarysSubmissions.push(
          await prisma.photoSubmission.create({
            data: {
              user_id: user1.app_id,
              window_id: northWindow.id,
              image_hash: generateImageHash(`st-marys-north-1`),
              timestamp: new Date('2024-01-15T10:30:00Z'),
              latitude: 53.9600,
              longitude: -1.0800,
              location_verified: true,
              metadata: {
                description: 'Stained glass window depicting biblical scenes',
                quality_score: 0.92,
                photographer_notes: 'Beautiful morning light through the north window',
              },
            },
          })
        );
        stMarysSubmissions.push(
          await prisma.photoSubmission.create({
            data: {
              user_id: user2.app_id,
              window_id: northWindow.id,
              image_hash: generateImageHash(`st-marys-north-2`),
              timestamp: new Date('2024-02-20T14:15:00Z'),
              latitude: 53.9600,
              longitude: -1.0800,
              location_verified: true,
              metadata: {
                description: 'Close-up detail of the north window',
                quality_score: 0.88,
              },
            },
          })
        );
      }

      // East Window - 1 photo
      const eastWindow = stMarysWindows.find((w) => w.location_description === 'East Window');
      if (eastWindow) {
        stMarysSubmissions.push(
          await prisma.photoSubmission.create({
            data: {
              user_id: user1.app_id,
              window_id: eastWindow.id,
              image_hash: generateImageHash(`st-marys-east-1`),
              timestamp: new Date('2024-03-10T11:00:00Z'),
              latitude: 53.9600,
              longitude: -1.0800,
              location_verified: true,
              metadata: {
                description: 'Large east window with rose pattern',
                quality_score: 0.95,
                photographer_notes: 'Captured during golden hour',
              },
            },
          })
        );
      }
    }

    // Create sample photo submissions for St. Peter's Cathedral
    const stPetersWindows = await prisma.window.findMany({
      where: { church_id: church2.id },
    });

    const stPetersSubmissions = [];
    if (stPetersWindows.length > 0) {
      // Rose Window - 1 photo
      const roseWindow = stPetersWindows.find((w) => w.location_description === 'Rose Window');
      if (roseWindow) {
        stPetersSubmissions.push(
          await prisma.photoSubmission.create({
            data: {
              user_id: user2.app_id,
              window_id: roseWindow.id,
              image_hash: generateImageHash(`st-peters-rose-1`),
              timestamp: new Date('2024-01-25T13:45:00Z'),
              latitude: 53.8008,
              longitude: -1.5491,
              location_verified: true,
              metadata: {
                description: 'Magnificent rose window with intricate geometric patterns',
                quality_score: 0.90,
                photographer_notes: 'One of the finest examples in the region',
              },
            },
          })
        );
      }

      // Chancel Window - 2 photos
      const chancelWindow = stPetersWindows.find((w) => w.location_description === 'Chancel Window');
      if (chancelWindow) {
        stPetersSubmissions.push(
          await prisma.photoSubmission.create({
            data: {
              user_id: user1.app_id,
              window_id: chancelWindow.id,
              image_hash: generateImageHash(`st-peters-chancel-1`),
              timestamp: new Date('2024-02-05T09:20:00Z'),
              latitude: 53.8008,
              longitude: -1.5491,
              location_verified: true,
              metadata: {
                description: 'Chancel window showing saints and angels',
                quality_score: 0.87,
              },
            },
          })
        );
        stPetersSubmissions.push(
          await prisma.photoSubmission.create({
            data: {
              user_id: user2.app_id,
              window_id: chancelWindow.id,
              image_hash: generateImageHash(`st-peters-chancel-2`),
              timestamp: new Date('2024-02-12T15:30:00Z'),
              latitude: 53.8008,
              longitude: -1.5491,
              location_verified: true,
              metadata: {
                description: 'Detail view of chancel window',
                quality_score: 0.91,
              },
            },
          })
        );
      }
    }

    // Create one unassigned photo submission (for testing assignment flow)
    const unassignedSubmission = await prisma.photoSubmission.create({
      data: {
        user_id: user1.app_id,
        window_id: null, // Not yet assigned
        image_hash: generateImageHash(`unassigned-1`),
        timestamp: new Date('2024-03-15T12:00:00Z'),
        latitude: 51.2794,
        longitude: 1.0800,
        location_verified: true,
        metadata: {
          description: 'Unassigned photo - needs window assignment',
          quality_score: 0.85,
        },
      },
    });

    // Update user contribution counts
    await prisma.user.update({
      where: { app_id: user1.app_id },
      data: {
        contribution_count: stMarysSubmissions.filter((s) => s.user_id === user1.app_id).length +
          stPetersSubmissions.filter((s) => s.user_id === user1.app_id).length +
          1, // +1 for unassigned
      },
    });

    await prisma.user.update({
      where: { app_id: user2.app_id },
      data: {
        contribution_count: stMarysSubmissions.filter((s) => s.user_id === user2.app_id).length +
          stPetersSubmissions.filter((s) => s.user_id === user2.app_id).length,
      },
    });

    console.log('✅ Created sample photo submissions');
    console.log(`   - ${stMarysSubmissions.length} photos for St. Mary's Church`);
    console.log(`   - ${stPetersSubmissions.length} photos for St. Peter's Cathedral`);
    console.log(`   - 1 unassigned photo (for testing assignment flow)`);

    console.log('\n✅ Test data seeded successfully!\n');
    console.log('Created churches:');
    console.log(`  - ${church1.name} (${church1.town}, ${church1.county}) - ID: ${church1.id}`);
    console.log(`  - ${church2.name} (${church2.town}, ${church2.county}) - ID: ${church2.id}`);
    console.log(`  - ${church3.name} (${church3.town}, ${church3.county}) - ID: ${church3.id}\n`);
    console.log('Created users:');
    console.log(`  - ${user1.app_id} (${user1.contribution_count} contributions)`);
    console.log(`  - ${user2.app_id} (${user2.contribution_count} contributions)\n`);
    console.log('Created photo submissions:');
    console.log(`  - ${stMarysSubmissions.length + stPetersSubmissions.length + 1} total photos`);
    console.log(`  - Photos assigned to windows: ${stMarysSubmissions.length + stPetersSubmissions.length}`);
    console.log(`  - Unassigned photos: 1\n`);
    console.log('You can now test:');
    console.log('  Phase 4: Search churches, view details, browse windows');
    console.log('  Phase 5: Upload photos with location verification');
    console.log('  Phase 6: Assign photos to windows using floor plan\n');
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

