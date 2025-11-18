import OpenAI from 'openai';
import { env } from '../config/env';
import logger from '../utils/logger';

export interface AIClassificationResult {
  isStainedGlassWindow: boolean;
  confidence: number;
  reasoning?: string;
}

export interface AIQualityAssessment {
  score: number; // 0-100
  isHighQuality: boolean;
  issues: string[];
  brightness?: 'too_dark' | 'too_bright' | 'good';
  sharpness?: 'blurry' | 'sharp' | 'slightly_blurry';
  framing?: 'poor' | 'good' | 'excellent';
  reasoning?: string;
}

export interface AIWindowIdentification {
  suggestedWindowId?: string;
  confidence: number;
  reasoning?: string;
  locationDescription?: string;
}

export interface AIAnalysisResult {
  classification: AIClassificationResult;
  quality: AIQualityAssessment;
  windowIdentification?: AIWindowIdentification;
  shouldFilter: boolean;
  filterReason?: string;
}

// Cache for AI analysis results (keyed by image hash)
const analysisCache = new Map<string, AIAnalysisResult>();

export class AIService {
  private client: OpenAI | null = null;
  private enabled: boolean = false;

  constructor() {
    if (env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });
      this.enabled = true;
      logger.info('AI Service initialized with OpenAI API');
    } else {
      logger.warn('AI Service disabled: OPENAI_API_KEY not configured');
    }
  }

  /**
   * Check if AI service is enabled
   */
  isEnabled(): boolean {
    return this.enabled && this.client !== null;
  }

  /**
   * Analyze an image using AI
   * Returns cached result if available
   */
  async analyzeImage(
    imageBuffer: Buffer,
    imageHash: string,
    churchId: string,
    windows?: Array<{ id: string; location_description?: string }>
  ): Promise<AIAnalysisResult> {
    // Check cache first
    const cacheKey = imageHash;
    if (analysisCache.has(cacheKey)) {
      logger.info('Using cached AI analysis result', { imageHash });
      return analysisCache.get(cacheKey)!;
    }

    if (!this.isEnabled()) {
      // Return default result when AI is disabled
      return this.getDefaultAnalysisResult();
    }

    try {
      // Convert image buffer to base64
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.detectMimeType(imageBuffer);

      // Perform all analyses in parallel
      const [classification, quality, windowId] = await Promise.all([
        this.classifyImage(base64Image, mimeType),
        this.assessQuality(base64Image, mimeType),
        windows && windows.length > 0
          ? this.identifyWindow(base64Image, mimeType, windows)
          : Promise.resolve(undefined),
      ]);

      const result: AIAnalysisResult = {
        classification,
        quality,
        windowIdentification: windowId,
        shouldFilter: this.shouldFilterImage(classification, quality),
        filterReason: this.getFilterReason(classification, quality),
      };

      // Cache the result
      analysisCache.set(cacheKey, result);

      logger.info('AI analysis completed', {
        imageHash,
        isStainedGlass: classification.isStainedGlassWindow,
        qualityScore: quality.score,
        shouldFilter: result.shouldFilter,
      });

      return result;
    } catch (error: any) {
      logger.error('AI analysis failed', { error, imageHash });
      // Return default result on error (allows upload to proceed)
      return this.getDefaultAnalysisResult(true);
    }
  }

  /**
   * Classify if image is a stained glass window
   */
  private async classifyImage(
    base64Image: string,
    mimeType: string
  ): Promise<AIClassificationResult> {
    if (!this.client) {
      return { isStainedGlassWindow: true, confidence: 0.5 };
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and determine if it shows a stained glass window. 
                Respond with a JSON object containing:
                - "isStainedGlassWindow": boolean (true if this is clearly a stained glass window)
                - "confidence": number (0-1, how confident you are)
                - "reasoning": string (brief explanation)
                
                Consider: stained glass windows typically have colorful glass pieces, lead lines, 
                religious or decorative imagery, and are usually seen from inside a church or 
                building. Filter out: regular windows, doors, paintings, photographs of windows, 
                or other non-stained-glass objects.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);
      return {
        isStainedGlassWindow: result.isStainedGlassWindow === true,
        confidence: result.confidence ?? 0.5,
        reasoning: result.reasoning,
      };
    } catch (error: any) {
      logger.error('Image classification failed', { error });
      // Fallback: assume it's a stained glass window (don't filter)
      return { isStainedGlassWindow: true, confidence: 0.5 };
    }
  }

  /**
   * Assess image quality
   */
  private async assessQuality(
    base64Image: string,
    mimeType: string
  ): Promise<AIQualityAssessment> {
    if (!this.client) {
      return {
        score: 70,
        isHighQuality: true,
        issues: [],
      };
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze the quality of this stained glass window photo. 
                Respond with a JSON object containing:
                - "score": number (0-100, overall quality score)
                - "isHighQuality": boolean (true if score >= 70)
                - "issues": array of strings (e.g., ["too dark", "blurry", "poor framing"])
                - "brightness": string ("too_dark" | "too_bright" | "good")
                - "sharpness": string ("blurry" | "slightly_blurry" | "sharp")
                - "framing": string ("poor" | "good" | "excellent")
                - "reasoning": string (brief explanation)
                
                Consider: brightness, sharpness/focus, framing/composition, 
                whether the window is fully visible, and overall photo quality.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);
      return {
        score: result.score ?? 70,
        isHighQuality: result.isHighQuality ?? true,
        issues: result.issues ?? [],
        brightness: result.brightness,
        sharpness: result.sharpness,
        framing: result.framing,
        reasoning: result.reasoning,
      };
    } catch (error: any) {
      logger.error('Quality assessment failed', { error });
      // Fallback: assume good quality
      return {
        score: 70,
        isHighQuality: true,
        issues: [],
      };
    }
  }

  /**
   * Identify which window this photo shows (if windows are provided)
   */
  private async identifyWindow(
    base64Image: string,
    mimeType: string,
    windows: Array<{ id: string; location_description?: string }>
  ): Promise<AIWindowIdentification | undefined> {
    if (!this.client || windows.length === 0) {
      return undefined;
    }

    try {
      const windowsDescription = windows
        .map(
          (w, idx) =>
            `${idx + 1}. Window ID: ${w.id}${w.location_description ? ` - ${w.location_description}` : ''}`
        )
        .join('\n');

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this stained glass window photo and identify which window it shows 
                from the following list:
                
                ${windowsDescription}
                
                Respond with a JSON object containing:
                - "suggestedWindowId": string (the ID of the most likely window, or null if uncertain)
                - "confidence": number (0-1, how confident you are)
                - "reasoning": string (brief explanation)
                - "locationDescription": string (describe the window's location/position if helpful)
                
                Consider: window design, position, size, and any distinguishing features. 
                If you cannot confidently identify the window, set suggestedWindowId to null.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);
      return {
        suggestedWindowId: result.suggestedWindowId || undefined,
        confidence: result.confidence ?? 0.5,
        reasoning: result.reasoning,
        locationDescription: result.locationDescription,
      };
    } catch (error: any) {
      logger.error('Window identification failed', { error });
      return undefined;
    }
  }

  /**
   * Determine if image should be filtered out
   */
  private shouldFilterImage(
    classification: AIClassificationResult,
    quality: AIQualityAssessment
  ): boolean {
    // Filter if not a stained glass window
    if (!classification.isStainedGlassWindow && classification.confidence > 0.7) {
      return true;
    }

    // Filter if very low quality
    if (quality.score < 30) {
      return true;
    }

    // Filter if multiple critical issues
    if (quality.issues.length >= 3) {
      return true;
    }

    return false;
  }

  /**
   * Get reason for filtering
   */
  private getFilterReason(
    classification: AIClassificationResult,
    quality: AIQualityAssessment
  ): string | undefined {
    if (!classification.isStainedGlassWindow && classification.confidence > 0.7) {
      return 'Image does not appear to be a stained glass window';
    }

    if (quality.score < 30) {
      return `Very low quality (score: ${quality.score})`;
    }

    if (quality.issues.length >= 3) {
      return `Multiple quality issues: ${quality.issues.join(', ')}`;
    }

    return undefined;
  }

  /**
   * Get default analysis result (used when AI is disabled or fails)
   */
  private getDefaultAnalysisResult(aiFailed: boolean = false): AIAnalysisResult {
    return {
      classification: {
        isStainedGlassWindow: true,
        confidence: 0.5,
        reasoning: aiFailed
          ? 'AI analysis failed, assuming valid stained glass window'
          : 'AI analysis not available',
      },
      quality: {
        score: 70,
        isHighQuality: true,
        issues: [],
        reasoning: aiFailed
          ? 'AI analysis failed, assuming acceptable quality'
          : 'AI analysis not available',
      },
      shouldFilter: false,
    };
  }

  /**
   * Detect MIME type from image buffer
   */
  private detectMimeType(buffer: Buffer): string {
    // Check magic bytes
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      return 'image/jpeg';
    }
    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      return 'image/png';
    }
    // Default to JPEG
    return 'image/jpeg';
  }

  /**
   * Clear analysis cache (useful for testing or memory management)
   */
  clearCache(): void {
    analysisCache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return analysisCache.size;
  }
}

export default new AIService();

