import { NextRequest, NextResponse } from 'next/server';
import { parseSimilarwebFile } from '@/src/lib/similarweb/parser';
import { importSimilarwebData } from '@/src/lib/similarweb/importer';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const toolId = formData.get('toolId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!toolId) {
      return NextResponse.json(
        { error: 'No tool ID provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or Excel file.' },
        { status: 400 }
      );
    }
    
    // Parse the file
    let parsedData;
    try {
      parsedData = await parseSimilarwebFile(file);
    } catch (parseError: any) {
      console.error('Error parsing file:', parseError);
      console.error('Error stack:', parseError.stack);
      
      const errorMessage = parseError.message || 'Unknown error';
      
      return NextResponse.json(
        { error: `Failed to parse file: ${errorMessage}` },
        { status: 400 }
      );
    }
    
    // Import the data
    const result = await importSimilarwebData(toolId, parsedData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to import data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Similarweb data imported successfully',
      reportId: result.reportId,
    });
  } catch (error: any) {
    console.error('Error in Similarweb import API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


