from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import numpy as np
import base64
import io
import os

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    from rembg import remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False

class ImageProcessor:
    """Advanced image processing for signature digitization"""
    
    def __init__(self):
        self.supported_formats = ['PNG', 'JPEG', 'JPG', 'SVG']
    
    def process_signature(self, image_path, auto_crop=True, enhance=True):
        """
        Process a signature image with advanced algorithms
        - Background removal
        - Noise reduction
        - Edge smoothing
        - Auto-cropping
        - Contrast enhancement
        """
        try:
            # Load image
            img = Image.open(image_path)
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Remove background using rembg (AI-powered)
            img_no_bg = remove(img)
            
            # Convert to numpy array for OpenCV processing
            img_array = np.array(img_no_bg)
            
            # Noise reduction
            if enhance:
                img_array = self._reduce_noise(img_array)
            
            # Edge smoothing and anti-aliasing
            img_array = self._smooth_edges(img_array)
            
            # Auto-crop to signature bounds
            if auto_crop:
                img_array = self._auto_crop(img_array)
            
            # Enhance contrast
            if enhance:
                img_array = self._enhance_contrast(img_array)
            
            # Convert back to PIL Image
            processed_img = Image.fromarray(img_array)
            
            # Generate different formats
            formats = self._generate_formats(processed_img)
            
            return {
                'original_size': img.size,
                'processed_size': processed_img.size,
                'formats': formats,
                'preview': self._image_to_base64(processed_img, 'PNG')
            }
        
        except Exception as e:
            raise Exception(f"Error processing signature: {str(e)}")
    
    def _reduce_noise(self, img_array):
        """Reduce noise using bilateral filtering"""
        # Bilateral filter preserves edges while reducing noise
        return cv2.bilateralFilter(img_array, 9, 75, 75)
    
    def _smooth_edges(self, img_array):
        """Smooth edges with anti-aliasing"""
        # Apply Gaussian blur for smoothing
        return cv2.GaussianBlur(img_array, (3, 3), 0)
    
    def _auto_crop(self, img_array):
        """Automatically crop to signature bounds with padding"""
        # Convert to grayscale for processing
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGBA2GRAY)
        else:
            gray = img_array
        
        # Find non-zero pixels (signature content)
        coords = cv2.findNonZero(gray)
        
        if coords is not None:
            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(coords)
            
            # Add padding (10% of dimensions)
            padding_x = int(w * 0.1)
            padding_y = int(h * 0.1)
            
            # Ensure we don't go out of bounds
            x = max(0, x - padding_x)
            y = max(0, y - padding_y)
            w = min(img_array.shape[1] - x, w + 2 * padding_x)
            h = min(img_array.shape[0] - y, h + 2 * padding_y)
            
            # Crop the image
            return img_array[y:y+h, x:x+w]
        
        return img_array
    
    def _enhance_contrast(self, img_array):
        """Enhance contrast for better visibility"""
        # Convert to PIL for enhancement
        img = Image.fromarray(img_array)
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.2)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.3)
        
        return np.array(img)
    
    def _generate_formats(self, img):
        """Generate different format versions (PNG, JPG, SVG-ready)"""
        formats = {}
        
        # PNG (transparent)
        formats['png'] = self._image_to_base64(img, 'PNG')
        
        # JPG (white background)
        jpg_img = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'RGBA':
            jpg_img.paste(img, mask=img.split()[3])
        else:
            jpg_img.paste(img)
        formats['jpg'] = self._image_to_base64(jpg_img, 'JPEG')
        
        return formats
    
    def _image_to_base64(self, img, format='PNG'):
        """Convert PIL Image to base64 string"""
        buffered = io.BytesIO()
        img.save(buffered, format=format)
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/{format.lower()};base64,{img_str}"
    
    def save_base64_image(self, base64_string, output_path):
        """Save a base64 encoded image to file"""
        try:
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Decode and save
            img_data = base64.b64decode(base64_string)
            img = Image.open(io.BytesIO(img_data))
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            img.save(output_path)
            return True
        
        except Exception as e:
            raise Exception(f"Error saving image: {str(e)}")
    
    def resize_image(self, image_path, width=None, height=None, maintain_aspect=True):
        """Resize an image while maintaining quality"""
        img = Image.open(image_path)
        
        if maintain_aspect:
            if width and not height:
                ratio = width / img.width
                height = int(img.height * ratio)
            elif height and not width:
                ratio = height / img.height
                width = int(img.width * ratio)
        
        resized = img.resize((width, height), Image.Resampling.LANCZOS)
        return resized
    
    def adjust_opacity(self, image_path, opacity):
        """Adjust image opacity (0.0 to 1.0)"""
        img = Image.open(image_path)
        
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Adjust alpha channel
        alpha = img.split()[3]
        alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
        img.putalpha(alpha)
        
        return img
