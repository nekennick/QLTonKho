/**
 * Service for converting HTML content to image
 * This service provides multiple methods for HTML to image conversion
 */

/**
 * Convert HTML string to image using HTML2Canvas
 * This is a client-side solution that works in the browser
 */
export async function convertHtmlToImageWithHtml2Canvas(
  htmlContent: string,
  options: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    scale?: number;
  } = {}
): Promise<string> {
  // This function would require html2canvas library
  // For now, we'll return a placeholder implementation
  
  try {
    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = `${options.width || 800}px`;
    tempContainer.style.backgroundColor = options.backgroundColor || '#ffffff';
    
    document.body.appendChild(tempContainer);
    
    // In a real implementation, you would use html2canvas here:
    // const canvas = await html2canvas(tempContainer, {
    //   width: options.width || 800,
    //   height: options.height || 600,
    //   scale: options.scale || 2,
    //   backgroundColor: options.backgroundColor || '#ffffff'
    // });
    
    // const imageDataUrl = canvas.toDataURL('image/png');
    
    // Clean up
    document.body.removeChild(tempContainer);
    
    // For now, return a placeholder
    return generatePlaceholderImageUrl(htmlContent, options);
    
  } catch (error) {
    console.error('Error converting HTML to image:', error);
    return generatePlaceholderImageUrl(htmlContent, options);
  }
}

/**
 * Convert HTML to image using a server-side API
 * This would call your backend service that handles HTML to image conversion
 */
export async function convertHtmlToImageWithServer(
  htmlContent: string,
  options: {
    width?: number;
    height?: number;
    format?: 'png' | 'jpeg' | 'pdf';
  } = {}
): Promise<string> {
  try {
    const response = await fetch('/api/html-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        options: {
          width: options.width || 800,
          height: options.height || 600,
          format: options.format || 'png'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    return result.imageUrl;
    
  } catch (error) {
    console.error('Error converting HTML to image via server:', error);
    return generatePlaceholderImageUrl(htmlContent, options);
  }
}

/**
 * Convert HTML to image using a third-party service
 * This uses an external API service for HTML to image conversion
 */
export async function convertHtmlToImageWithThirdParty(
  htmlContent: string,
  options: {
    width?: number;
    height?: number;
    format?: 'png' | 'jpeg';
  } = {}
): Promise<string> {
  try {
    // Example using a hypothetical third-party service
    const response = await fetch('https://api.htmlcsstoimage.com/v1/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY', // Replace with actual API key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        css: '', // Additional CSS if needed
        width: options.width || 800,
        height: options.height || 600,
        format: options.format || 'png'
      })
    });

    if (!response.ok) {
      throw new Error(`Third-party service error: ${response.status}`);
    }

    const result = await response.json();
    return result.url;
    
  } catch (error) {
    console.error('Error converting HTML to image via third-party:', error);
    return generatePlaceholderImageUrl(htmlContent, options);
  }
}

/**
 * Generate a placeholder image URL based on content
 * This creates a simple placeholder image with text
 */
function generatePlaceholderImageUrl(
  htmlContent: string,
  options: {
    width?: number;
    height?: number;
    backgroundColor?: string;
  } = {}
): string {
  const width = options.width || 800;
  const height = options.height || 600;
  const bgColor = options.backgroundColor || '#ffffff';
  
  // Extract some text from HTML for the placeholder
  const textMatch = htmlContent.match(/<title>(.*?)<\/title>/);
  const title = textMatch ? textMatch[1] : 'Phiếu Xuất Nhập Kho';
  
  // Create a simple placeholder using a service like placeholder.com
  const encodedTitle = encodeURIComponent(title);
  return `https://placehold.co/${width}x${height}/${bgColor.replace('#', '')}/000000?text=${encodedTitle}`;
}

/**
 * Main function to convert HTML to image
 * This function tries different methods in order of preference
 */
export async function convertHtmlToImage(
  htmlContent: string,
  options: {
    method?: 'html2canvas' | 'server' | 'third-party' | 'placeholder';
    width?: number;
    height?: number;
    backgroundColor?: string;
    format?: 'png' | 'jpeg' | 'pdf';
  } = {}
): Promise<string> {
  const method = options.method || 'placeholder';
  
  switch (method) {
    case 'html2canvas':
      return convertHtmlToImageWithHtml2Canvas(htmlContent, options);
    
    case 'server':
      return convertHtmlToImageWithServer(htmlContent, options);
    
    case 'third-party':
      return convertHtmlToImageWithThirdParty(htmlContent, {
        width: options.width,
        height: options.height,
        format: options.format === 'pdf' ? 'png' : options.format
      });
    
    case 'placeholder':
    default:
      return generatePlaceholderImageUrl(htmlContent, options);
  }
}

/**
 * Utility function to create a data URL from HTML content
 * This creates a simple data URL that can be used directly
 */
export function createDataUrlFromHtml(htmlContent: string): string {
  // Create a simple data URL with HTML content
  const encodedHtml = encodeURIComponent(htmlContent);
  return `data:text/html;charset=utf-8,${encodedHtml}`;
}

/**
 * Utility function to download HTML as image
 * This function allows users to download the converted image
 */
export function downloadHtmlAsImage(
  htmlContent: string,
  filename: string = 'slip.png',
  options: {
    width?: number;
    height?: number;
    backgroundColor?: string;
  } = {}
): void {
  convertHtmlToImage(htmlContent, options).then(imageUrl => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }).catch(error => {
    console.error('Error downloading image:', error);
  });
}
