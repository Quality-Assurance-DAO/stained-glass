#!/usr/bin/env tsx

/**
 * AI Service Test Script
 * Tests the AI service with dummy data and test images
 */

import aiService from '../src/services/AIService';
import prisma from '../src/config/database';
import { calculateImageHash } from '../src/utils/imageHash';
import sharp from 'sharp';

interface TestResult {
  testName: string;
  success: boolean;
  result?: any;
  error?: string;
  duration?: number;
}

/**
 * Create a simple test image using sharp
 */
async function createTestImage(
  width: number = 800,
  height: number = 1200,
  description: string = 'test'
): Promise<Buffer> {
  // Create a colorful test image that resembles stained glass
  // Using gradients and patterns to simulate stained glass appearance
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B0000;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#FFD700;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00008B;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6347;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4B0082;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad1)" />
      <rect x="${width * 0.1}" y="${height * 0.1}" width="${width * 0.3}" height="${height * 0.8}" fill="url(#grad2)" opacity="0.7" />
      <rect x="${width * 0.6}" y="${height * 0.1}" width="${width * 0.3}" height="${height * 0.8}" fill="#228B22" opacity="0.6" />
      <line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" stroke="#000000" stroke-width="3" />
      <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="#000000" stroke-width="3" />
      <text x="${width / 2}" y="${height / 2}" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${description}</text>
    </svg>
  `;

  return await sharp(Buffer.from(svg))
    .jpeg({ quality: 90 })
    .toBuffer();
}

/**
 * Download a sample stained glass image from a public URL
 */
async function downloadSampleImage(): Promise<Buffer | null> {
  try {
    // Using a placeholder service - in production, you might use a real stained glass image URL
    // For now, we'll use a simple test image generator
    console.log('📸 Creating test image (simulating stained glass)...');
    return await createTestImage(800, 1200, 'Stained Glass Test');
  } catch (error: any) {
    console.error('Failed to download sample image:', error.message);
    return null;
  }
}

/**
 * Test AI classification
 */
async function testClassification(imageBuffer: Buffer, imageHash: string): Promise<TestResult> {
  const startTime = Date.now();
  try {
    // Create a mock church ID for testing
    const churchId = 'test-church-id';
    
    const result = await aiService.analyzeImage(imageBuffer, imageHash, churchId);
    const duration = Date.now() - startTime;

    return {
      testName: 'Image Classification',
      success: true,
      result: {
        isStainedGlass: result.classification.isStainedGlassWindow,
        confidence: result.classification.confidence,
        reasoning: result.classification.reasoning,
      },
      duration,
    };
  } catch (error: any) {
    return {
      testName: 'Image Classification',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test quality assessment
 */
async function testQualityAssessment(imageBuffer: Buffer, imageHash: string): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const churchId = 'test-church-id';
    const result = await aiService.analyzeImage(imageBuffer, imageHash, churchId);
    const duration = Date.now() - startTime;

    return {
      testName: 'Quality Assessment',
      success: true,
      result: {
        score: result.quality.score,
        isHighQuality: result.quality.isHighQuality,
        issues: result.quality.issues,
        brightness: result.quality.brightness,
        sharpness: result.quality.sharpness,
        framing: result.quality.framing,
        reasoning: result.quality.reasoning,
      },
      duration,
    };
  } catch (error: any) {
    return {
      testName: 'Quality Assessment',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test window identification with real church data
 */
async function testWindowIdentification(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    // Get first church with windows from database
    const church = await prisma.church.findFirst({
      include: {
        windows: {
          take: 3, // Get up to 3 windows for testing
        },
      },
    });

    if (!church || church.windows.length === 0) {
      return {
        testName: 'Window Identification',
        success: false,
        error: 'No churches with windows found in database. Run seed script first.',
        duration: Date.now() - startTime,
      };
    }

    const imageBuffer = await createTestImage(800, 1200, `Window: ${church.windows[0].location_description}`);
    const imageHash = await calculateImageHash(imageBuffer);

    const windowsForAI = church.windows.map((w) => ({
      id: w.id,
      location_description: w.location_description || undefined,
    }));

    const result = await aiService.analyzeImage(
      imageBuffer,
      imageHash,
      church.id,
      windowsForAI
    );
    const duration = Date.now() - startTime;

    return {
      testName: 'Window Identification',
      success: true,
      result: {
        churchName: church.name,
        availableWindows: windowsForAI.map((w) => w.location_description || w.id),
        suggestedWindowId: result.windowIdentification?.suggestedWindowId,
        confidence: result.windowIdentification?.confidence,
        reasoning: result.windowIdentification?.reasoning,
        locationDescription: result.windowIdentification?.locationDescription,
      },
      duration,
    };
  } catch (error: any) {
    return {
      testName: 'Window Identification',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test full analysis pipeline
 */
async function testFullAnalysis(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    // Get first church with windows
    const church = await prisma.church.findFirst({
      include: {
        windows: {
          take: 3,
        },
      },
    });

    if (!church) {
      return {
        testName: 'Full Analysis Pipeline',
        success: false,
        error: 'No churches found in database. Run seed script first.',
        duration: Date.now() - startTime,
      };
    }

    const imageBuffer = await downloadSampleImage();
    if (!imageBuffer) {
      return {
        testName: 'Full Analysis Pipeline',
        success: false,
        error: 'Failed to create test image',
        duration: Date.now() - startTime,
      };
    }

    const imageHash = await calculateImageHash(imageBuffer);
    const windowsForAI = church.windows.map((w) => ({
      id: w.id,
      location_description: w.location_description || undefined,
    }));

    const result = await aiService.analyzeImage(
      imageBuffer,
      imageHash,
      church.id,
      windowsForAI.length > 0 ? windowsForAI : undefined
    );
    const duration = Date.now() - startTime;

    return {
      testName: 'Full Analysis Pipeline',
      success: true,
      result: {
        churchName: church.name,
        classification: {
          isStainedGlass: result.classification.isStainedGlassWindow,
          confidence: result.classification.confidence,
          reasoning: result.classification.reasoning,
        },
        quality: {
          score: result.quality.score,
          isHighQuality: result.quality.isHighQuality,
          issues: result.quality.issues,
          brightness: result.quality.brightness,
          sharpness: result.quality.sharpness,
          framing: result.quality.framing,
        },
        windowIdentification: result.windowIdentification
          ? {
              suggestedWindowId: result.windowIdentification.suggestedWindowId,
              confidence: result.windowIdentification.confidence,
              reasoning: result.windowIdentification.reasoning,
            }
          : null,
        shouldFilter: result.shouldFilter,
        filterReason: result.filterReason,
      },
      duration,
    };
  } catch (error: any) {
    return {
      testName: 'Full Analysis Pipeline',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test caching functionality
 */
async function testCaching(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const imageBuffer = await createTestImage(800, 1200, 'Cache Test');
    const imageHash = await calculateImageHash(imageBuffer);
    const churchId = 'test-church-id';

    // Clear cache first
    aiService.clearCache();
    const initialCacheSize = aiService.getCacheSize();

    // First call - should not be cached
    const firstCallStart = Date.now();
    await aiService.analyzeImage(imageBuffer, imageHash, churchId);
    const firstCallDuration = Date.now() - firstCallStart;
    const afterFirstCacheSize = aiService.getCacheSize();

    // Second call - should be cached (much faster)
    const secondCallStart = Date.now();
    await aiService.analyzeImage(imageBuffer, imageHash, churchId);
    const secondCallDuration = Date.now() - secondCallStart;
    const afterSecondCacheSize = aiService.getCacheSize();

    const duration = Date.now() - startTime;

    return {
      testName: 'Caching',
      success: true,
      result: {
        initialCacheSize,
        afterFirstCacheSize,
        afterSecondCacheSize,
        firstCallDuration: `${firstCallDuration}ms`,
        secondCallDuration: `${secondCallDuration}ms`,
        speedup: firstCallDuration > 0 ? `${Math.round((firstCallDuration / secondCallDuration) * 10) / 10}x faster` : 'N/A',
      },
      duration,
    };
  } catch (error: any) {
    return {
      testName: 'Caching',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Print test result
 */
function printResult(result: TestResult): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test: ${result.testName}`);
  console.log(`Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
  if (result.duration !== undefined) {
    console.log(`Duration: ${result.duration}ms`);
  }

  if (result.success && result.result) {
    console.log('\nResult:');
    console.log(JSON.stringify(result.result, null, 2));
    
    // Show note about fallback values if using defaults
    if (result.testName === 'Image Classification' && result.result.confidence === 0.5 && !result.result.reasoning) {
      console.log('\n💡 Note: Using fallback values (AI may have had trouble with test image)');
    }
    if (result.testName === 'Quality Assessment' && result.result.score === 70 && result.result.issues.length === 0 && !result.result.reasoning) {
      console.log('\n💡 Note: Using fallback values (AI may have had trouble with test image)');
    }
  } else if (result.error) {
    console.log(`\nError: ${result.error}`);
  }
}

/**
 * Main test runner
 */
async function runTests(): Promise<void> {
  console.log('🧪 AI Service Test Suite\n');
  console.log('Checking AI service status...');

  if (!aiService.isEnabled()) {
    console.error('❌ AI Service is not enabled!');
    console.error('   Make sure OPENAI_API_KEY is set in your .env file');
    process.exit(1);
  }

  console.log('✅ AI Service is enabled\n');

  const results: TestResult[] = [];

  // Test 1: Classification
  console.log('Running Test 1: Image Classification...');
  const imageBuffer1 = await createTestImage(800, 1200, 'Stained Glass Window');
  const imageHash1 = await calculateImageHash(imageBuffer1);
  results.push(await testClassification(imageBuffer1, imageHash1));
  printResult(results[results.length - 1]);

  // Test 2: Quality Assessment
  console.log('\nRunning Test 2: Quality Assessment...');
  const imageBuffer2 = await createTestImage(800, 1200, 'Quality Test');
  const imageHash2 = await calculateImageHash(imageBuffer2);
  results.push(await testQualityAssessment(imageBuffer2, imageHash2));
  printResult(results[results.length - 1]);

  // Test 3: Window Identification (requires database)
  console.log('\nRunning Test 3: Window Identification...');
  results.push(await testWindowIdentification());
  printResult(results[results.length - 1]);

  // Test 4: Full Analysis Pipeline
  console.log('\nRunning Test 4: Full Analysis Pipeline...');
  results.push(await testFullAnalysis());
  printResult(results[results.length - 1]);

  // Test 5: Caching
  console.log('\nRunning Test 5: Caching...');
  results.push(await testCaching());
  printResult(results[results.length - 1]);

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Test Summary');
  console.log(`${'='.repeat(60)}`);

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);

  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const duration = result.duration !== undefined ? ` (${result.duration}ms)` : '';
    console.log(`  ${status} Test ${index + 1}: ${result.testName}${duration}`);
  });

  console.log(`\n${'='.repeat(60)}\n`);

  if (failed > 0) {
    console.log('⚠️  Some tests failed. Check the errors above.');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

