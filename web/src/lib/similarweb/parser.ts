import * as XLSX from 'xlsx';

export interface ParsedSimilarwebData {
  reportPeriodStart?: string;
  reportPeriodEnd?: string;
  totalVisits?: number;
  monthlyVisits?: number;
  pagesPerVisit?: number;
  bounceRate?: number;
  visitDurationSeconds?: number;
  avgVisitDurationSeconds?: number;
  globalRank?: number;
  countryRank?: number;
  industryRank?: number;
  industry?: string;
  monthlyData?: Array<{ month: string; visits: number }>;
}

/**
 * Convert Excel serial date number to YYYY-MM-DD string
 * Excel dates are days since January 1, 1900
 */
function excelDateToISOString(excelDate: number): string {
  // Excel epoch is January 1, 1900, but Excel incorrectly treats 1900 as a leap year
  // So we need to adjust: Excel date 1 = Jan 1, 1900
  const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899 (adjusted for Excel's leap year bug)
  const date = new Date(excelEpoch.getTime() + excelDate * 24 * 60 * 60 * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse duration string like "00:02:16" (HH:MM:SS) to seconds
 */
function parseDurationToSeconds(duration: string): number | undefined {
  if (!duration || typeof duration !== 'string') return undefined;
  
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  return undefined;
}

/**
 * Parse number from various formats (string with commas, number, etc.)
 */
function parseNumber(value: any): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'number') {
    return isNaN(value) ? undefined : value;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}

/**
 * Parse date from various formats
 */
function parseDate(value: any): string | undefined {
  if (!value) return undefined;
  
  // If it's an Excel serial date number
  if (typeof value === 'number' && value > 1 && value < 1000000) {
    return excelDateToISOString(value);
  }
  
  // If it's already a date string
  if (typeof value === 'string') {
    // Try to parse various date formats
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Try MM.YY format (e.g., "09.25")
    const mmYYMatch = value.match(/(\d{2})\.(\d{2})/);
    if (mmYYMatch) {
      const month = mmYYMatch[1];
      const year = '20' + mmYYMatch[2];
      return `${year}-${month}-01`;
    }
  }
  
  return undefined;
}

export async function parseExcelFile(file: File): Promise<ParsedSimilarwebData> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  const data: ParsedSimilarwebData = {};
  const monthlyData: Array<{ month: string; visits: number }> = [];
  
  // Parse the "Total" sheet which contains the main metrics
  const totalSheet = workbook.Sheets['Total'];
  if (totalSheet) {
    const jsonData = XLSX.utils.sheet_to_json(totalSheet, { header: 1, defval: null }) as any[][];
    
    if (jsonData.length > 0) {
      // First row contains headers
      const headers = jsonData[0] as string[];
      
      // Find column indices
      const dateIndex = headers.findIndex(h => h && String(h).toLowerCase().includes('date'));
      const visitsIndex = headers.findIndex(h => h && String(h).toLowerCase().includes('visit') && !String(h).toLowerCase().includes('duration') && !String(h).toLowerCase().includes('page'));
      const pagesPerVisitIndex = headers.findIndex(h => h && String(h).includes('Pages / Visit') || String(h).includes('Pages/Visit'));
      const bounceRateIndex = headers.findIndex(h => h && String(h).toLowerCase().includes('bounce rate'));
      const visitDurationIndex = headers.findIndex(h => h && String(h).toLowerCase().includes('avg. visit duration') || String(h).toLowerCase().includes('visit duration'));
      
      // Process data rows (skip header row)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        
        // Extract monthly visits
        if (dateIndex >= 0 && visitsIndex >= 0) {
          const dateValue = row[dateIndex];
          const visitsValue = row[visitsIndex];
          
          if (dateValue !== null && dateValue !== undefined && visitsValue !== null && visitsValue !== undefined) {
            const month = parseDate(dateValue);
            const visits = parseNumber(visitsValue);
            
            if (month && visits !== undefined) {
              monthlyData.push({ month, visits: Math.round(visits) });
            }
          }
        }
      }
      
      // Sort monthly data and use LATEST MONTH's data for metrics
      if (monthlyData.length > 0) {
        const sortedMonthly = [...monthlyData].sort((a, b) => a.month.localeCompare(b.month));
        const latestMonth = sortedMonthly[sortedMonthly.length - 1];
        
        // Set report period from monthly data
        data.reportPeriodStart = sortedMonthly[0].month;
        data.reportPeriodEnd = latestMonth.month;
        
        // Use latest month's visits
        data.monthlyVisits = latestMonth.visits;
        data.totalVisits = latestMonth.visits; // Use latest month as total for consistency
        
        // Find the row corresponding to the latest month and extract its metrics
        const latestMonthDate = latestMonth.month.substring(0, 7); // YYYY-MM
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;
          
          const dateValue = row[dateIndex];
          const month = parseDate(dateValue);
          
          if (month && month.startsWith(latestMonthDate)) {
            // Extract metrics from latest month's row
            // Pages per Visit
            if (pagesPerVisitIndex >= 0 && row[pagesPerVisitIndex] !== null && row[pagesPerVisitIndex] !== undefined) {
              data.pagesPerVisit = parseNumber(row[pagesPerVisitIndex]);
            }
            
            // Bounce Rate (stored as decimal, e.g., 0.484 = 48.4%)
            if (bounceRateIndex >= 0 && row[bounceRateIndex] !== null && row[bounceRateIndex] !== undefined) {
              const bounceRate = parseNumber(row[bounceRateIndex]);
              if (bounceRate !== undefined) {
                // Convert to percentage if it's a decimal (0.484 -> 48.4)
                data.bounceRate = bounceRate < 1 ? bounceRate * 100 : bounceRate;
              }
            }
            
            // Visit Duration
            if (visitDurationIndex >= 0 && row[visitDurationIndex] !== null && row[visitDurationIndex] !== undefined) {
              const duration = String(row[visitDurationIndex]);
              const seconds = parseDurationToSeconds(duration);
              if (seconds !== undefined) {
                data.visitDurationSeconds = seconds;
                data.avgVisitDurationSeconds = seconds;
              }
            }
            
            break; // Found the latest month, stop searching
          }
        }
      }
    }
  }
  
  // Parse "Report Details" sheet for period and rank information
  const reportSheet = workbook.Sheets['Report Details'];
  if (reportSheet) {
    const jsonData = XLSX.utils.sheet_to_json(reportSheet, { header: 1, defval: null }) as any[][];
    
    // Look for date range (format: "09.25 - 11.25")
    for (const row of jsonData) {
      if (!row || row.length < 5) continue;
      
      const rowStr = row.map(c => String(c || '')).join(' ').toLowerCase();
      
      // Extract date range
      if (rowStr.includes('date range:') || rowStr.includes('09.25') || rowStr.includes('11.25')) {
        const dateRangeMatch = String(row[4] || '').match(/(\d{2})\.(\d{2})\s*-\s*(\d{2})\.(\d{2})/);
        if (dateRangeMatch) {
          const startMonth = dateRangeMatch[1];
          const startYear = '20' + dateRangeMatch[2];
          const endMonth = dateRangeMatch[3];
          const endYear = '20' + dateRangeMatch[4];
          
          if (!data.reportPeriodStart) {
            data.reportPeriodStart = `${startYear}-${startMonth}-01`;
          }
          if (!data.reportPeriodEnd) {
            data.reportPeriodEnd = `${endYear}-${endMonth}-01`;
          }
        }
      }
      
      // Look for rank information (might be in different formats)
      if (rowStr.includes('rank') || rowStr.includes('industry')) {
        // Try to extract rank numbers from the row
        for (const cell of row) {
          const cellStr = String(cell || '').toLowerCase();
          if (cellStr.includes('global rank') || cellStr.includes('worldwide rank')) {
            // Look for number in adjacent cells
            const cellIndex = row.indexOf(cell);
            if (cellIndex >= 0 && cellIndex < row.length - 1) {
              const rankValue = parseNumber(row[cellIndex + 1]);
              if (rankValue !== undefined) {
                data.globalRank = Math.round(rankValue);
              }
            }
          }
          if (cellStr.includes('industry rank')) {
            const cellIndex = row.indexOf(cell);
            if (cellIndex >= 0 && cellIndex < row.length - 1) {
              const rankValue = parseNumber(row[cellIndex + 1]);
              if (rankValue !== undefined) {
                data.industryRank = Math.round(rankValue);
              }
            }
          }
          if (cellStr.includes('industry:') || (cellStr.includes('industry') && cellStr.length < 50)) {
            const cellIndex = row.indexOf(cell);
            if (cellIndex >= 0 && cellIndex < row.length - 1) {
              const industryName = String(row[cellIndex + 1] || '').trim();
              if (industryName && industryName.length > 0 && industryName.length < 100) {
                data.industry = industryName;
              }
            }
          }
        }
      }
    }
  }
  
  // Sort monthly data by month
  if (monthlyData.length > 0) {
    data.monthlyData = monthlyData.sort((a, b) => a.month.localeCompare(b.month));
  }
  
  return data;
}

export async function parsePDFFile(file: File): Promise<ParsedSimilarwebData> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Use pdf-parse v1.x for server-side PDF text extraction (doesn't use PDF.js workers)
  let fullText = '';
  try {
    // pdf-parse v1.x is a CommonJS module
    // Use require directly in server-side context to avoid Next.js bundling issues
    if (typeof window !== 'undefined') {
      throw new Error('PDF parsing is only supported server-side. Please upload from the admin panel.');
    }
    
    // Use require for CommonJS modules in Node.js/Next.js server context
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParseFn = require('pdf-parse');
    
    if (typeof pdfParseFn !== 'function') {
      throw new Error('pdf-parse function not found. Make sure pdf-parse@1.1.1 is installed.');
    }
    
    // Call the function with the buffer
    const pdfData = await pdfParseFn(buffer);
    fullText = pdfData.text || '';
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Failed to parse PDF: ${error.message}. Please ensure the file is a valid PDF or convert it to Excel format (.xlsx).`);
  }
  
  if (!fullText || fullText.trim().length === 0) {
    throw new Error('Could not extract text from PDF. The PDF might be image-based or corrupted. Please convert to Excel format (.xlsx).');
  }
  
  const data: ParsedSimilarwebData = {};
  
  // Parse ranks from text using comprehensive regex patterns
  // The PDF format has ranks on separate lines:
  // "Global rank"
  // "#13,114"
  // "Country rank"
  // "United States"
  // "#11,541"
  // "Industry rank"
  // ".../Computers_Electronics_and_Technology"
  // "#466"
  
  // Global Rank patterns - Look for "#number" after "Global rank" (can be on next line)
  const globalRankPatterns = [
    /global\s+rank\s*[\n\r]+\s*#([\d,]+)/i,
    /global\s+rank[:\s]+#([\d,]+)/i,
    /worldwide\s+rank[:\s]+#?([\d,]+)/i,
  ];
  
  for (const pattern of globalRankPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const rank = parseNumber(match[1]);
      if (rank !== undefined && rank > 0) {
        data.globalRank = Math.round(rank);
        break;
      }
    }
  }
  
  // Country Rank patterns - Look for "#number" after "Country rank" and country name (can be on next line)
  const countryRankPatterns = [
    /country\s+rank\s*[\n\r]+\s*[^\n\r]+\s*[\n\r]+\s*#([\d,]+)/i,
    /country\s+rank\s*[\n\r]+\s*#([\d,]+)/i,
    /country\s+rank[:\s]+(?:[^\n\r]+\s+)?#([\d,]+)/i,
    /rank\s+in\s+country[:\s]+#?([\d,]+)/i,
  ];
  
  for (const pattern of countryRankPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const rank = parseNumber(match[1]);
      if (rank !== undefined && rank > 0) {
        data.countryRank = Math.round(rank);
        break;
      }
    }
  }
  
  // Industry Rank patterns - Look for "#number" after "Industry rank" and industry name (can be on next line)
  const industryRankPatterns = [
    /industry\s+rank\s*[\n\r]+\s*[^\n\r]+\s*[\n\r]+\s*#([\d,]+)/i,
    /industry\s+rank\s*[\n\r]+\s*#([\d,]+)/i,
    /industry\s+rank[:\s]+(?:[^\n\r]+\s+)?#([\d,]+)/i,
    /category\s+rank[:\s]+#?([\d,]+)/i,
    /rank\s+in\s+industry[:\s]+#?([\d,]+)/i,
  ];
  
  for (const pattern of industryRankPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const rank = parseNumber(match[1]);
      if (rank !== undefined && rank > 0) {
        data.industryRank = Math.round(rank);
        break;
      }
    }
  }
  
  // Industry name patterns - Extract from line after "Industry rank"
  // Format: "Industry rank\n.../Computers_Electronics_and_Technology 	#466"
  const industryPatterns = [
    /industry\s+rank\s+([^\n#]+?)(?:\s+#[\d,]+|\n|$)/i,
    /industry\s+rank[:\s]+([^\n#]+?)(?:\s+#[\d,]+|\n|$)/i,
    /category[:\s]+([^\n#]+?)(?:\s+rank|\s+#[\d,]+|\n|$)/i,
  ];
  
  for (const pattern of industryPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      let industryName = match[1].trim();
      
      // Clean up the industry name - remove leading dots/slashes, underscores
      industryName = industryName
        .replace(/^\.\.\.\//, '') // Remove leading ".../"
        .replace(/^\.\.\//, '') // Remove leading "../"
        .replace(/^\.\//, '') // Remove leading "./"
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Skip if it's too short, contains rank keywords, or is just numbers
      if (industryName.length > 2 && 
          industryName.length < 100 && 
          !industryName.toLowerCase().includes('rank') &&
          !industryName.toLowerCase().includes('country') &&
          !industryName.toLowerCase().includes('global') &&
          !/^\d+$/.test(industryName)) {
        data.industry = industryName;
        break;
      }
    }
  }
  
  // If we didn't find any ranks, provide helpful error
  if (!data.globalRank && !data.countryRank && !data.industryRank) {
    throw new Error('Could not extract ranking data from PDF. The PDF might not contain rank information, or it may be in an unexpected format. You can manually enter rankings in the admin panel after uploading.');
  }
  
  return data;
}

export async function parseSimilarwebFile(file: File): Promise<ParsedSimilarwebData> {
  if (file.name.endsWith('.pdf')) {
    // PDF parsing is now supported using pdf-parse library
    return await parsePDFFile(file);
  } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    return parseExcelFile(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or Excel file.');
  }
}
