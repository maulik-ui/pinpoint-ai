/**
 * Reddit Answers Browser Automation Collector
 * Uses browser automation to interact with reddit.com/answers/ and extract responses
 * 
 * This collector navigates to Reddit Answers, submits a question, and extracts the raw response
 * without modification, as specified in the requirements.
 */

import type { Tool, RawSourceData, SentimentConfig } from '../types';
import { DEFAULT_SENTIMENT_CONFIG } from '../config';

/**
 * Reddit Answers response structure
 */
type RedditAnswersResponse = {
  source: 'reddit_answers';
  tool_name: string;
  question_asked: string;
  raw_answer: string;
  metadata: {
    timestamp_utc: string;
    notes: string;
  };
};

/**
 * Collects Reddit data using Reddit Answers browser automation
 * Navigates to reddit.com/answers/, submits question, and extracts response
 * 
 * @param tool - Tool definition with id, name, and optional search_query
 * @param config - Configuration for collection (lookback period, limits, etc.)
 * @returns Raw source data with text blocks and metadata
 */
export async function collectRedditAnswersData(
  tool: Tool,
  config: SentimentConfig = DEFAULT_SENTIMENT_CONFIG
): Promise<RawSourceData> {
  // Check if Puppeteer is available
  let puppeteer: any;
  try {
    puppeteer = await import('puppeteer');
  } catch (error) {
    throw new Error(
      'Puppeteer is not installed. Please install it with: npm install puppeteer'
    );
  }

  const windowEnd = new Date();
  const windowStart = new Date();
  windowStart.setMonth(windowStart.getMonth() - config.lookback_months);

  // Build the exact question as specified
  const question = `What do people on reddit think about "${tool.name}"? Give me an overall sentiment score from 0 to 10. Also summarize the top 10 positives, the top 10 negatives, and the major features of the tool.`;

  let browser: any = null;
  let page: any = null;
  let rawAnswer = '';

  try {
    console.log(`[Reddit Answers] Starting browser automation for ${tool.name}...`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    page = await browser.newPage();

    // Set a reasonable viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to Reddit Answers
    console.log(`[Reddit Answers] Navigating to reddit.com/answers/...`);
    await page.goto('https://www.reddit.com/answers/', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait a bit for page to fully load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Debug: Log page title and URL to verify we're on the right page
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log(`[Reddit Answers] Page loaded - Title: ${pageTitle}, URL: ${pageUrl}`);

    // Try to find the question input box
    // Reddit Answers may use various selectors - trying multiple approaches
    const questionSelectors = [
      // Common Reddit selectors
      'textarea[placeholder*="question" i]',
      'textarea[placeholder*="ask" i]',
      'textarea[placeholder*="What" i]',
      'input[placeholder*="question" i]',
      'input[placeholder*="ask" i]',
      // Data attributes
      '[data-testid*="question"]',
      '[data-testid*="textarea"]',
      '[data-testid*="input"]',
      // Aria labels
      '[aria-label*="question" i]',
      '[aria-label*="ask" i]',
      '[aria-label*="What" i]',
      // Class-based (Reddit often uses specific classes)
      'textarea[class*="textarea"]',
      'textarea[class*="input"]',
      'textarea[class*="question"]',
      // Generic fallbacks
      'textarea',
      'input[type="text"]',
    ];

    let questionInput: any = null;
    let foundSelector = '';

    // First, try waiting for any textarea to appear (most likely)
    try {
      await page.waitForSelector('textarea', { timeout: 10000 });
      console.log(`[Reddit Answers] Found at least one textarea on the page`);
    } catch (e) {
      console.warn(`[Reddit Answers] No textarea found after waiting`);
    }

    // Try each selector
    for (const selector of questionSelectors) {
      try {
        const elements = await page.$$(selector);
        console.log(`[Reddit Answers] Selector "${selector}" found ${elements.length} elements`);
        
        for (const el of elements) {
          // Check if element is visible and interactable
          const isVisible = await el.evaluate((e: any) => {
            const style = window.getComputedStyle(e);
            const rect = e.getBoundingClientRect();
            return (
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              style.opacity !== '0' &&
              rect.width > 0 &&
              rect.height > 0
            );
          });

          if (isVisible) {
            questionInput = el;
            foundSelector = selector;
            console.log(`[Reddit Answers] ✅ Found visible question input with selector: ${selector}`);
            break;
          }
        }
        
        if (questionInput) break;
      } catch (e) {
        // Try next selector
        continue;
      }
    }

    // If still not found, try to get all textareas and inputs for debugging
    if (!questionInput) {
      console.error(`[Reddit Answers] Could not find question input. Debugging page structure...`);
      const allTextareas = await page.$$eval('textarea', (elements: any[]) =>
        elements.map((el: any) => ({
          placeholder: el.placeholder,
          id: el.id,
          className: el.className,
          ariaLabel: el.getAttribute('aria-label'),
          dataTestId: el.getAttribute('data-testid'),
        }))
      );
      const allInputs = await page.$$eval('input', (elements: any[]) =>
        elements.map((el: any) => ({
          type: el.type,
          placeholder: el.placeholder,
          id: el.id,
          className: el.className,
          ariaLabel: el.getAttribute('aria-label'),
          dataTestId: el.getAttribute('data-testid'),
        }))
      );
      console.error(`[Reddit Answers] Found ${allTextareas.length} textareas:`, allTextareas);
      console.error(`[Reddit Answers] Found ${allInputs.length} inputs:`, allInputs);
      
      throw new Error(
        `Could not find question input box on Reddit Answers page. Found ${allTextareas.length} textareas and ${allInputs.length} inputs. Page may have changed structure.`
      );
    }

    // Type the question
    console.log(`[Reddit Answers] Submitting question: ${question.substring(0, 50)}...`);
    await questionInput.click({ clickCount: 3 }); // Select all if there's existing text
    await questionInput.type(question, { delay: 50 }); // Type with small delay to appear human

    // Find and click the submit button
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Ask")',
      'button:has-text("Post")',
      '[data-testid*="submit"]',
      '[aria-label*="submit" i]',
    ];

    let submitButton: any = null;
    for (const selector of submitSelectors) {
      try {
        submitButton = await page.$(selector);
        if (submitButton) {
          const isVisible = await submitButton.evaluate((el: any) => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
          });
          if (isVisible) {
            console.log(`[Reddit Answers] Found submit button with selector: ${selector}`);
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (!submitButton) {
      throw new Error('Could not find submit button on Reddit Answers page');
    }

    // Click submit
    await submitButton.click();

    // Wait for response to appear
    // Reddit Answers typically shows a loading state, then the answer
    console.log(`[Reddit Answers] Waiting for response...`);
    
    // Wait for answer container to appear
    // Common patterns: answer text, response div, etc.
    const answerSelectors = [
      '[data-testid*="answer"]',
      '[class*="answer" i]',
      '[id*="answer" i]',
      'article',
      '[role="article"]',
      'main',
    ];

    let answerElement: any = null;
    let waitedTime = 0;
    const maxWaitTime = 60000; // 60 seconds max wait
    const checkInterval = 1000; // Check every second

    while (waitedTime < maxWaitTime) {
      for (const selector of answerSelectors) {
        try {
          const elements = await page.$$(selector);
          for (const el of elements) {
            const text = await el.evaluate((e: any) => e.textContent || '');
            // Check if this looks like an answer (has substantial text and mentions the tool or sentiment)
            if (
              text.length > 100 &&
              (text.toLowerCase().includes(tool.name.toLowerCase()) ||
                text.includes('sentiment') ||
                text.includes('positive') ||
                text.includes('negative') ||
                text.match(/\d+\s*\/\s*10/) ||
                text.match(/score.*\d+/i))
            ) {
              answerElement = el;
              console.log(`[Reddit Answers] Found answer element with selector: ${selector}`);
              break;
            }
          }
          if (answerElement) break;
        } catch (e) {
          continue;
        }
      }
      if (answerElement) break;

      // Wait a bit before checking again
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
      waitedTime += checkInterval;
    }

    if (!answerElement) {
      // Fallback: try to get any substantial text content from the page
      console.warn(`[Reddit Answers] Could not find answer element, trying fallback...`);
      const pageText = await page.evaluate(() => document.body.textContent || '');
      if (pageText.length > 200) {
        rawAnswer = pageText;
      } else {
        throw new Error('Reddit Answers did not return a response within timeout period');
      }
    } else {
      // Extract the full text of the answer
      rawAnswer = await answerElement.evaluate((el: any) => el.textContent || el.innerText || '');
    }

    // Clean up the answer (remove excessive whitespace but preserve structure)
    rawAnswer = rawAnswer
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    if (!rawAnswer || rawAnswer.length < 50) {
      throw new Error('Reddit Answers returned an empty or too short response');
    }

    console.log(`[Reddit Answers] Successfully extracted answer (${rawAnswer.length} chars)`);

    // Build the response structure as specified
    const response: RedditAnswersResponse = {
      source: 'reddit_answers',
      tool_name: tool.name,
      question_asked: question,
      raw_answer: rawAnswer,
      metadata: {
        timestamp_utc: new Date().toISOString(),
        notes: 'Direct output from Reddit Answers with no modification.',
      },
    };

    // Convert to RawSourceData format for the pipeline
    return {
      source: 'reddit',
      tool_id: tool.id,
      text_blocks: [
        `REDDIT ANSWERS RESPONSE:\n\nQuestion: ${response.question_asked}\n\nAnswer:\n${response.raw_answer}`,
      ],
      metadata: {
        total_items: 1,
        window_start: windowStart.toISOString(),
        window_end: windowEnd.toISOString(),
        reddit_answers_response: response, // Store full response for reference
      },
    };
  } catch (error) {
    console.error(`[Reddit Answers] Collection failed for ${tool.name}:`, error);
    throw new Error(
      `Reddit Answers collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    // Clean up browser resources
    if (page) {
      try {
        await page.close();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

