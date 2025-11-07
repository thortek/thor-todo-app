# Image Analysis Feature - Quick Guide

## Overview
Added AI-powered image analysis using Ollama's vision models (llava) alongside your existing chat functionality.

## Setup

### 1. Install the Vision Model
```bash
# Pull the llava vision model
ollama pull llava

# Verify it's installed
ollama list | grep llava
```

### 2. Start Ollama (if not already running)
```bash
ollama serve
```

### 3. Environment Configuration
Your `.env` now includes:
```env
OLLAMA_VISION_MODEL=llava
```

## Features

### 7 Built-in Analysis Types

1. **General Description** - Detailed description of the image
2. **Identify Objects** - Lists all objects found in the image
3. **Extract Text (OCR)** - Reads any text visible in the image
4. **Color Analysis** - Describes colors, palette, and mood
5. **Technical Analysis** - Composition, lighting, and quality assessment
6. **Creative Caption** - Generates creative stories or captions
7. **Accessibility Description** - Helpful descriptions for visually impaired users
8. **Custom Prompt** - Write your own analysis prompt

## How to Use

1. Click the **🔍 Image Analysis** tab
2. **Upload an image**:
   - Click the upload area or drag & drop
   - Supports: PNG, JPG, GIF, WebP (max 10MB)
3. **Select analysis type** from the dropdown
4. Click **Analyze Image**
5. Watch the AI stream its analysis in real-time!

## What Makes It Cool

### Real-Time Streaming
- Analysis streams word-by-word just like the chat
- See results as they're generated

### Markdown Support
- Results rendered with full markdown
- Code blocks with syntax highlighting
- Formatted lists, headings, etc.

### Smart Analysis
Vision models can:
- Describe scenes in detail
- Identify objects and people
- Read text (OCR capabilities)
- Analyze colors and composition
- Understand context and relationships
- Generate creative interpretations

## Example Use Cases

### Document Analysis
Upload a screenshot or photo of a document to extract text

### Accessibility
Generate descriptions for images to make content accessible

### Technical Review
Analyze photo composition, lighting, and technical quality

### Creative Writing
Get creative story prompts based on images

### Object Identification
Find out what objects are in a complex scene

### Color Inspiration
Analyze color palettes for design work

## Architecture

### Backend
- **aiService.ts**: `analyzeImage()` and `analyzeImageStream()` functions
- **visionController.ts**: Handles image upload and streaming
- **visionRoutes.ts**: POST `/api/vision/analyze` endpoint

### Frontend
- **visionModel.ts**: TypeScript interfaces and predefined prompts
- **visionApiService.ts**: API client with streaming support
- **visionViewer.ts**: Full UI with upload, preview, and results
- **main.ts**: Navigation integration

## API Endpoint

### POST `/api/vision/analyze`
**Request:**
```json
{
  "imageData": "data:image/png;base64,...",
  "prompt": "Describe this image in detail."
}
```

**Response:** Server-Sent Events stream
```
data: {"content":"This image shows"}
data: {"content":" a beautiful"}
...
data: {"done":true}
```

## Tips

1. **Better Results**: Use specific prompts for better analysis
2. **Image Quality**: Higher quality images = better analysis
3. **File Size**: Keep images under 10MB
4. **Model Selection**: `llava` works well, but you can try `llava-phi3` for faster results

## Troubleshooting

### "Failed to analyze image"
1. Verify llava model is installed: `ollama list`
2. Check Ollama is running: `curl http://localhost:11434/api/tags`
3. Check browser console for errors

### Slow Analysis
- Vision models are larger than text models
- First analysis may be slower (model loading)
- Consider using `llava-phi3` for faster results

### Image Won't Upload
- Check file size (max 10MB)
- Ensure it's a valid image format
- Try converting to PNG or JPG

## Future Enhancements

Possible additions:
- Compare multiple images
- Save analysis results
- Batch processing
- Image editing suggestions
- Style transfer analysis
- Face detection (if ethically appropriate)

## Model Information

**llava** (default):
- ~4.5GB download
- High quality analysis
- Supports various image types
- Good at detail and context

**Alternative: llava-phi3**:
- Smaller, faster model
- Good for quick analysis
- Less detailed but still accurate

To switch models, update `.env`:
```env
OLLAMA_VISION_MODEL=llava-phi3
```
