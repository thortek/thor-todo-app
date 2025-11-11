# Flux Image Generation Feature

## Overview
This document describes the implementation of AI-powered image generation using Black Forest Labs' Flux models (Schnell, Dev, and 1.1 Pro), hosted via Replicate API.

## Available Models

### 1. Flux Schnell
- **Speed**: Fastest (1-4 inference steps)
- **Quality**: Good for rapid iterations
- **Cost**: Free tier available
- **Best For**: Quick prototyping, testing prompts, high-volume generation
- **Model ID**: `black-forest-labs/flux-schnell`

### 2. Flux Dev
- **Speed**: Moderate (requires more steps)
- **Quality**: Higher quality, better detail
- **Cost**: Standard pricing
- **Best For**: Production-ready images, balanced quality/speed
- **Model ID**: `black-forest-labs/flux-dev`

### 3. Flux 1.1 Pro
- **Speed**: Slowest (highest quality requires patience)
- **Quality**: Maximum detail and accuracy
- **Cost**: Premium pricing
- **Best For**: Final outputs, marketing materials, maximum quality needs
- **Model ID**: `black-forest-labs/flux-1.1-pro`

## Architecture

### Backend Components

#### 1. AI Service (`server/services/aiService.ts`)
- **Function**: `generateImage(options: ImageGenerationOptions)`
- **Models**: 
  - `black-forest-labs/flux-schnell` (default)
  - `black-forest-labs/flux-dev`
  - `black-forest-labs/flux-1.1-pro`
- **Provider**: Replicate API
- **Features**:
  - Model selection via `model` parameter
  - Aspect ratio support (1:1, 16:9, 21:9, 3:2, 2:3, 4:5, 5:4, 3:4, 4:3, 9:16, 9:21)
  - Adjustable inference steps (1-50, default: 4)
  - Guidance control (0-20, default: 3.5)
  - Optional seed for reproducible results
  - Safety checker enabled by default
  - Fast mode enabled (`go_fast: true`)

**Note**: All Flux models use aspect ratios rather than exact pixel dimensions. The service automatically converts width/height to the closest supported aspect ratio.

```typescript
const output = await replicate.run(
  "black-forest-labs/flux-schnell",
  { input: {
    prompt,
    width,
    height,
    num_outputs: 1,
    num_inference_steps: 4,
    guidance_scale: 3.5
  }}
)
```

#### 2. Controller (`server/controllers/imageGenController.ts`)
- **Handler**: `generateImageHandler(req, res)`
- **Validation**: Ensures prompt is provided
- **Response**: Returns JSON with success status, image URLs, and original prompt
- **Error Handling**: Catches and returns detailed error messages

#### 3. Routes (`server/routes/imageGenRoutes.ts`)
- **Endpoint**: `POST /api/image-gen/generate`
- **Request Body**:
  ```json
  {
    "prompt": "string (required)",
    "model": "string (optional: 'flux-schnell', 'flux-dev', 'flux-1.1-pro', default: 'flux-schnell')",
    "width": "number (optional, default: 1024)",
    "height": "number (optional, default: 1024)",
    "numInferenceSteps": "number (optional, default: 4)",
    "guidanceScale": "number (optional, default: 3.5)",
    "seed": "number (optional, random if not provided)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "images": ["https://replicate.delivery/..."],
    "prompt": "original prompt text"
  }
  ```

### Frontend Components

#### 1. Type Definitions (`src/imageGenModel.ts`)
- `ImageGenerationRequest`: Request interface with all generation parameters
- `ImageGenerationResponse`: Success response with image URLs
- `ImageGenerationError`: Error response structure

#### 2. API Service (`src/imageGenApiService.ts`)
- **Function**: `generateImageAPI(request: ImageGenerationRequest)`
- **URL**: `http://localhost:3100/api/image-gen/generate`
- **Method**: POST with JSON body
- **Error Handling**: Catches and re-throws errors with descriptive messages

#### 3. UI Component (`src/imageGenViewer.ts`)
- **Class**: `ImageGenViewer`
- **Container**: Renders into `#imagegen-container`
- **Features**:
  - **Model selector dropdown** with three options:
    - Flux Schnell (fastest, free)
    - Flux Dev (balanced quality)
    - Flux 1.1 Pro (best quality, premium)
  - Multi-line text area for prompts
  - Aspect ratio dropdown (11 options)
  - Inference steps input (1-50)
  - Guidance scale input (0-20 with 0.1 increments)
  - Optional seed input for reproducibility
  - Generate button with loading state and model name
  - Status messages showing which model is being used
  - Image display with "Open in new tab" link
  - Keyboard shortcut: Shift+Enter to generate

#### 4. Navigation Integration (`src/main.ts`)
- Added fourth tab: 🎨 Image Generation
- View switching between todos/chat/vision/imagegen
- Lazy initialization: ImageGenViewer created on first tab switch

### Styling (`src/style.css`)

```css
/* Image Generation Styles */
.image-gen-container - Main container styling
.image-gen-header - Header section
.image-gen-controls - Form controls section
.settings-grid - 2-column grid for settings
.image-display - Generated image display area
.generated-images - Image list container
.image-wrapper - Individual image wrapper
.generated-image - Styled image with shadow and rounded corners
.image-actions - Action buttons below image
```

## Configuration

### Environment Variables
Add to `.env` file:
```bash
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

### Security
- ✅ API token stored server-side only
- ✅ Never exposed to client
- ✅ Safety checker enabled by default
- ✅ HTML escaping for user-provided prompt display

## Usage Flow

1. **User Action**: 
   - Click "🎨 Image Generation" tab
   - Enter descriptive prompt
   - Optionally adjust settings (dimensions, steps, guidance, seed)
   - Click "🎨 Generate Image" or press Shift+Enter

2. **Frontend**:
   - Validates prompt exists
   - Shows loading state
   - Calls `generateImageAPI()` with parameters

3. **Backend**:
   - Validates request
   - Calls Replicate API with Flux-Schnell model
   - Waits for image generation (30-60 seconds)
   - Returns image URL(s)

4. **Display**:
   - Shows generated image with shadow/rounded styling
   - Displays original prompt
   - Provides "Open in new tab" link
   - Shows success message

## Performance Considerations

### Generation Time
- **Typical Duration**: 30-60 seconds per image
- **User Feedback**: 
  - Button shows "⏳ Generating..."
  - Status message: "Generating your image... This may take 30-60 seconds."
  - Button disabled during generation

### Model Settings
- **Fast Mode**: 
  - 4 inference steps (default)
  - Lower guidance scale (3.5)
  - Faster but potentially lower quality

- **Quality Mode**:
  - 20-50 inference steps
  - Higher guidance scale (7-10)
  - Slower but higher quality

### Image Delivery
- Images hosted by Replicate CDN
- URL format: `https://replicate.delivery/...`
- No local storage required

## Error Handling

### Common Errors
1. **Missing Prompt**: "Please enter a prompt" (client-side validation)
2. **API Failure**: Shows error message from Replicate
3. **Network Issues**: Generic "Failed to generate image" error
4. **Invalid Token**: "Authentication failed" from Replicate

### Error Display
- Red text status message
- Console error logging
- Button returns to normal state
- User can retry immediately

## Testing

### Manual Testing Steps
1. Start server: `npm run server`
2. Start frontend: `npm run dev`
3. Navigate to Image Generation tab
4. Test various prompts:
   - Simple: "a red apple"
   - Complex: "a futuristic city at sunset with flying cars"
   - Artistic: "oil painting of a mountain landscape"
5. Test different dimensions and settings
6. Test with and without seed values
7. Verify error handling with empty prompt

### Expected Behavior
- ✅ Button disables during generation
- ✅ Status updates appropriately
- ✅ Generated image displays correctly
- ✅ Image opens in new tab when clicked
- ✅ Can generate multiple images sequentially
- ✅ Settings persist between generations (not cleared)

## Future Enhancements

### Potential Features
1. **Multiple Images**: Support `numOutputs > 1`
2. **Image History**: Save generated images to gallery
3. **Prompt Library**: Pre-made prompt templates
4. **Style Presets**: Quick settings for different art styles
5. **Download Button**: Save image directly to device
6. **Prompt Enhancement**: Use AI to improve user prompts
7. **Negative Prompts**: Specify what NOT to include
8. **Aspect Ratios**: Quick buttons for common ratios (1:1, 16:9, etc.)
9. **Generation Queue**: Generate multiple images in sequence
10. **Cost Tracking**: Display estimated/actual API costs

## Troubleshooting

### Issue: "Failed to generate image"
- **Check**: Replicate API token is valid
- **Check**: Token has sufficient credits
- **Check**: Network connection is stable
- **Solution**: Verify `.env` has correct `REPLICATE_API_TOKEN`

### Issue: Image takes too long
- **Cause**: High inference steps or server load
- **Solution**: Reduce `numInferenceSteps` to 4-10
- **Note**: Flux-Schnell is optimized for speed (4 steps typical)

### Issue: Image quality poor
- **Cause**: Too few inference steps or low guidance
- **Solution**: Increase steps to 10-20 and guidance to 5-7
- **Trade-off**: Slower generation time

### Issue: Same image every time
- **Cause**: Fixed seed value set
- **Solution**: Clear the seed input field for random generation

## API Costs

### Replicate Pricing
- Flux-Schnell is billed per second of compute time
- Typical cost: ~$0.003 per image (4 steps)
- Check current pricing: https://replicate.com/black-forest-labs/flux-schnell

### Cost Optimization
1. Use default 4 inference steps for speed
2. Generate at standard 1024x1024 resolution
3. Avoid unnecessary regenerations
4. Consider caching results

## References

- **Flux-Schnell Model**: https://replicate.com/black-forest-labs/flux-schnell
- **Replicate Documentation**: https://replicate.com/docs
- **Black Forest Labs**: https://blackforestlabs.ai/
- **Replicate Node.js SDK**: https://github.com/replicate/replicate-javascript

## Implementation Date
November 11, 2024

## Dependencies
```json
{
  "replicate": "^1.0.0" // or latest version
}
```
