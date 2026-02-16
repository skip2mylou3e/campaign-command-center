import { NextRequest } from 'next/server';

export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const maxSize = 100 * 1024; // 100KB
    if (file.size > maxSize) {
      return Response.json({ error: 'File exceeds 100KB limit' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
      const { PDFParse } = await import('pdf-parse');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = new PDFParse({ data: new Uint8Array(arrayBuffer) });
      const result = await pdf.getText();
      await pdf.destroy();
      return Response.json({ text: result.text });
    }

    if (ext === 'docx') {
      const mammoth = await import('mammoth');
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      return Response.json({ text: result.value });
    }

    return Response.json(
      { error: `Unsupported file type: .${ext}. Use this endpoint for .pdf and .docx files only.` },
      { status: 400 }
    );
  } catch (error) {
    console.error('File parse error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to parse file' },
      { status: 500 }
    );
  }
}
