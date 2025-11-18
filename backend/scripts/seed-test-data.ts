import prisma from '../src/config/database';

async function seedTestData() {
  console.log('🌱 Seeding test data for Phase 4 testing...\n');

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

    console.log('✅ Test data seeded successfully!\n');
    console.log('Created churches:');
    console.log(`  - ${church1.name} (${church1.town}, ${church1.county}) - ID: ${church1.id}`);
    console.log(`  - ${church2.name} (${church2.town}, ${church2.county}) - ID: ${church2.id}`);
    console.log(`  - ${church3.name} (${church3.town}, ${church3.county}) - ID: ${church3.id}\n`);
    console.log('You can now test Phase 4:');
    console.log('  1. Search for churches by county (e.g., "Yorkshire")');
    console.log('  2. Search for churches by town (e.g., "York")');
    console.log('  3. View church details and floor plans');
    console.log('  4. Browse windows for each church\n');
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

