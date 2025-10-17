from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import io
import base64
import os

class WatermarkCreator:
    """Create custom text and image watermarks"""
    
    def __init__(self):
        self.default_font_size = 48
        self.default_color = '#000000'
        self.default_opacity = 0.5
        
        # Preset templates
        self.templates = {
            'CONFIDENTIAL': {'color': '#FF0000', 'fontSize': 72, 'rotation': 45},
            'DRAFT': {'color': '#808080', 'fontSize': 64, 'rotation': 45},
            'COPY': {'color': '#0000FF', 'fontSize': 56, 'rotation': 0},
            'SAMPLE': {'color': '#FFA500', 'fontSize': 60, 'rotation': 45},
            'APPROVED': {'color': '#008000', 'fontSize': 52, 'rotation': 0},
            'VOID': {'color': '#FF0000', 'fontSize': 80, 'rotation': 45}
        }
    
    def create_text_watermark(self, text, font_size=None, color=None, 
                             opacity=None, rotation=0, font_name='Arial'):
        """
        Create a text-based watermark
        
        Args:
            text: The watermark text
            font_size: Font size in pixels
            color: Hex color code
            opacity: Opacity value (0.0 to 1.0)
            rotation: Rotation angle in degrees
            font_name: Font family name
        """
        try:
            font_size = font_size or self.default_font_size
            color = color or self.default_color
            opacity = opacity if opacity is not None else self.default_opacity
            
            # Convert hex color to RGB
            rgb_color = self._hex_to_rgb(color)
            
            # Try to load system font, fallback to default
            try:
                font = ImageFont.truetype(f"/System/Library/Fonts/Supplemental/{font_name}.ttf", font_size)
            except:
                try:
                    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
                except:
                    font = ImageFont.load_default()
            
            # Calculate text size
            dummy_img = Image.new('RGBA', (1, 1))
            draw = ImageDraw.Draw(dummy_img)
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Add padding
            padding = 40
            img_width = text_width + padding * 2
            img_height = text_height + padding * 2
            
            # Create image with transparent background
            img = Image.new('RGBA', (img_width, img_height), (255, 255, 255, 0))
            draw = ImageDraw.Draw(img)
            
            # Draw text
            draw.text(
                (padding, padding), 
                text, 
                fill=rgb_color + (int(255 * opacity),),
                font=font
            )
            
            # Rotate if needed
            if rotation != 0:
                img = img.rotate(rotation, expand=True, fillcolor=(255, 255, 255, 0))
            
            # Convert to base64
            base64_img = self._image_to_base64(img)
            
            return {
                'image': base64_img,
                'width': img.width,
                'height': img.height,
                'settings': {
                    'text': text,
                    'fontSize': font_size,
                    'color': color,
                    'opacity': opacity,
                    'rotation': rotation,
                    'fontName': font_name
                }
            }
        
        except Exception as e:
            raise Exception(f"Error creating text watermark: {str(e)}")
    
    def create_image_watermark(self, image_data, opacity=None, rotation=0, 
                              max_width=None, max_height=None):
        """
        Create an image-based watermark (e.g., company logo)
        
        Args:
            image_data: Base64 encoded image or file path
            opacity: Opacity value (0.0 to 1.0)
            rotation: Rotation angle in degrees
            max_width: Maximum width constraint
            max_height: Maximum height constraint
        """
        try:
            opacity = opacity if opacity is not None else self.default_opacity
            
            # Load image
            if image_data.startswith('data:'):
                # Base64 encoded
                img_data = image_data.split(',')[1]
                img = Image.open(io.BytesIO(base64.b64decode(img_data)))
            else:
                # File path
                img = Image.open(image_data)
            
            # Convert to RGBA
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Resize if constraints provided
            if max_width or max_height:
                img = self._resize_with_constraints(img, max_width, max_height)
            
            # Adjust opacity
            alpha = img.split()[3]
            alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
            img.putalpha(alpha)
            
            # Rotate if needed
            if rotation != 0:
                img = img.rotate(rotation, expand=True, fillcolor=(255, 255, 255, 0))
            
            # Convert to base64
            base64_img = self._image_to_base64(img)
            
            return {
                'image': base64_img,
                'width': img.width,
                'height': img.height,
                'settings': {
                    'opacity': opacity,
                    'rotation': rotation
                }
            }
        
        except Exception as e:
            raise Exception(f"Error creating image watermark: {str(e)}")
    
    def get_template(self, template_name):
        """Get a preset watermark template"""
        if template_name in self.templates:
            settings = self.templates[template_name]
            return self.create_text_watermark(
                text=template_name,
                font_size=settings['fontSize'],
                color=settings['color'],
                rotation=settings['rotation']
            )
        else:
            raise ValueError(f"Template '{template_name}' not found")
    
    def list_templates(self):
        """List all available preset templates"""
        return list(self.templates.keys())
    
    def _hex_to_rgb(self, hex_color):
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def _resize_with_constraints(self, img, max_width=None, max_height=None):
        """Resize image while maintaining aspect ratio"""
        width, height = img.size
        
        if max_width and width > max_width:
            ratio = max_width / width
            width = max_width
            height = int(height * ratio)
        
        if max_height and height > max_height:
            ratio = max_height / height
            height = max_height
            width = int(width * ratio)
        
        return img.resize((width, height), Image.Resampling.LANCZOS)
    
    def _image_to_base64(self, img):
        """Convert PIL Image to base64 string"""
        buffered = io.BytesIO()
        img.save(buffered, format='PNG')
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    
    def create_tiled_watermark(self, text, tile_spacing=200, canvas_size=(2000, 2000)):
        """Create a tiled watermark pattern for full-page coverage"""
        try:
            # Create base watermark
            base_watermark = self.create_text_watermark(
                text=text,
                opacity=0.1,
                rotation=45
            )
            
            # Decode base64 image
            img_data = base_watermark['image'].split(',')[1]
            tile_img = Image.open(io.BytesIO(base64.b64decode(img_data)))
            
            # Create canvas
            canvas = Image.new('RGBA', canvas_size, (255, 255, 255, 0))
            
            # Tile the watermark
            for y in range(0, canvas_size[1], tile_spacing):
                for x in range(0, canvas_size[0], tile_spacing):
                    canvas.paste(tile_img, (x, y), tile_img)
            
            # Convert to base64
            base64_img = self._image_to_base64(canvas)
            
            return {
                'image': base64_img,
                'width': canvas.width,
                'height': canvas.height,
                'type': 'tiled'
            }
        
        except Exception as e:
            raise Exception(f"Error creating tiled watermark: {str(e)}")
