// Client-side image processing without backend
export class ClientImageProcessor {
  
  // Simple background removal using canvas
  async removeBackground(imageFile) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Simple white background removal
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // If pixel is close to white, make it transparent
            const brightness = (r + g + b) / 3;
            if (brightness > 200) {
              data[i + 3] = 0; // Set alpha to 0 (transparent)
            }
          }
          
          // Put modified data back
          ctx.putImageData(imageData, 0, 0);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }
  
  // Auto-crop to content
  async autoCrop(imageBlob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageBlob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Find bounds of non-transparent pixels
        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;
        
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const alpha = data[(y * canvas.width + x) * 4 + 3];
            if (alpha > 0) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        
        // Add minimal padding for clean edges
        const padding = 5;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(canvas.width, maxX + padding);
        maxY = Math.min(canvas.height, maxY + padding);
        
        // Create cropped canvas
        const croppedWidth = maxX - minX;
        const croppedHeight = maxY - minY;
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        
        croppedCanvas.width = croppedWidth;
        croppedCanvas.height = croppedHeight;
        
        croppedCtx.drawImage(
          canvas,
          minX, minY, croppedWidth, croppedHeight,
          0, 0, croppedWidth, croppedHeight
        );
        
        croppedCanvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          resolve(blob);
        }, 'image/png');
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }
  
  // Process signature (combine background removal and cropping)
  async processSignature(imageFile) {
    try {
      const noBg = await this.removeBackground(imageFile);
      const cropped = await this.autoCrop(noBg);
      return cropped;
    } catch (error) {
      throw new Error('Failed to process signature: ' + error.message);
    }
  }
  
  // Create watermark from text
  async createTextWatermark(text, options = {}) {
    const {
      fontSize = 48,
      color = '#000000',
      opacity = 1.0,
      rotation = 0,
      fontFamily = 'Arial'
    } = options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set font
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    
    // Measure text
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.5;
    
    // Set canvas size with minimal padding
    const padding = 10;
    canvas.width = textWidth + padding * 2;
    canvas.height = textHeight + padding * 2;
    
    // Clear canvas (transparent background)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Set style
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text
    ctx.fillText(text, 0, 0);
    ctx.restore();
    
    // Convert to blob, then auto-crop
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        // Auto-crop to remove excess transparent space
        const cropped = await this.autoCrop(blob);
        resolve(cropped);
      }, 'image/png');
    });
  }
  
  // Convert blob to data URL
  blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  // Helper: Download blob as file
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Compress image to reduce storage size
  async compressImage(blob, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(blob)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        
        // Calculate new dimensions
        let width = img.width
        let height = img.height
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (compressedBlob) => {
            if (compressedBlob) {
              resolve(compressedBlob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/png',
          quality
        )
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image for compression'))
      }
      
      img.src = url
    })
  }
}

export default new ClientImageProcessor();
