from PIL import Image
import PyPDF2
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
import io
import base64
import os
import uuid

class DocumentHandler:
    """Handle document operations - PDF and image files"""
    
    def __init__(self):
        self.supported_formats = ['pdf', 'png', 'jpg', 'jpeg']
    
    def get_document_info(self, document_path):
        """Get information about a document"""
        try:
            file_ext = document_path.rsplit('.', 1)[1].lower()
            
            if file_ext == 'pdf':
                return self._get_pdf_info(document_path)
            elif file_ext in ['png', 'jpg', 'jpeg']:
                return self._get_image_info(document_path)
            else:
                raise ValueError(f"Unsupported file format: {file_ext}")
        
        except Exception as e:
            raise Exception(f"Error getting document info: {str(e)}")
    
    def _get_pdf_info(self, pdf_path):
        """Get PDF document information"""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            # Get first page dimensions
            first_page = pdf_reader.pages[0]
            width = float(first_page.mediabox.width)
            height = float(first_page.mediabox.height)
            
            return {
                'type': 'pdf',
                'pages': num_pages,
                'width': width,
                'height': height,
                'size': os.path.getsize(pdf_path)
            }
    
    def _get_image_info(self, image_path):
        """Get image document information"""
        img = Image.open(image_path)
        
        return {
            'type': 'image',
            'pages': 1,
            'width': img.width,
            'height': img.height,
            'format': img.format,
            'size': os.path.getsize(image_path)
        }
    
    def apply_overlay(self, document_path, overlay_data, position, size, pages='all'):
        """
        Apply signature or watermark overlay to a document
        
        Args:
            document_path: Path to the document
            overlay_data: Base64 encoded overlay image
            position: Dict with x, y coordinates
            size: Dict with width, height
            pages: 'all' or list of page numbers
        """
        try:
            file_ext = document_path.rsplit('.', 1)[1].lower()
            
            if file_ext == 'pdf':
                return self._apply_overlay_pdf(document_path, overlay_data, position, size, pages)
            elif file_ext in ['png', 'jpg', 'jpeg']:
                return self._apply_overlay_image(document_path, overlay_data, position, size)
            else:
                raise ValueError(f"Unsupported file format: {file_ext}")
        
        except Exception as e:
            raise Exception(f"Error applying overlay: {str(e)}")
    
    def _apply_overlay_pdf(self, pdf_path, overlay_data, position, size, pages):
        """Apply overlay to PDF document"""
        # Read the original PDF
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            pdf_writer = PyPDF2.PdfWriter()
            
            # Decode overlay image
            if ',' in overlay_data:
                overlay_data = overlay_data.split(',')[1]
            overlay_img = Image.open(io.BytesIO(base64.b64decode(overlay_data)))
            
            # Save overlay as temporary file
            temp_overlay_path = f"/tmp/overlay_{uuid.uuid4()}.png"
            overlay_img.save(temp_overlay_path, 'PNG')
            
            # Determine which pages to process
            total_pages = len(pdf_reader.pages)
            if pages == 'all':
                page_numbers = range(total_pages)
            else:
                page_numbers = [p - 1 for p in pages if 0 < p <= total_pages]
            
            # Process each page
            for page_num in range(total_pages):
                page = pdf_reader.pages[page_num]
                
                if page_num in page_numbers:
                    # Create overlay PDF for this page
                    packet = io.BytesIO()
                    can = canvas.Canvas(packet, pagesize=(float(page.mediabox.width), 
                                                          float(page.mediabox.height)))
                    
                    # Draw the overlay image
                    can.drawImage(
                        temp_overlay_path,
                        position['x'],
                        float(page.mediabox.height) - position['y'] - size['height'],
                        width=size['width'],
                        height=size['height'],
                        mask='auto',
                        preserveAspectRatio=True
                    )
                    can.save()
                    
                    # Move to the beginning of the BytesIO buffer
                    packet.seek(0)
                    overlay_pdf = PyPDF2.PdfReader(packet)
                    
                    # Merge overlay with original page
                    page.merge_page(overlay_pdf.pages[0])
                
                pdf_writer.add_page(page)
            
            # Save the result
            output_path = f"/tmp/output_{uuid.uuid4()}.pdf"
            with open(output_path, 'wb') as output_file:
                pdf_writer.write(output_file)
            
            # Clean up
            if os.path.exists(temp_overlay_path):
                os.remove(temp_overlay_path)
            
            return output_path
    
    def _apply_overlay_image(self, image_path, overlay_data, position, size):
        """Apply overlay to image document"""
        # Open base image
        base_img = Image.open(image_path)
        
        # Convert to RGBA if needed
        if base_img.mode != 'RGBA':
            base_img = base_img.convert('RGBA')
        
        # Decode overlay image
        if ',' in overlay_data:
            overlay_data = overlay_data.split(',')[1]
        overlay_img = Image.open(io.BytesIO(base64.b64decode(overlay_data)))
        
        # Resize overlay to specified size
        overlay_img = overlay_img.resize((size['width'], size['height']), 
                                        Image.Resampling.LANCZOS)
        
        # Create a new image for compositing
        result = base_img.copy()
        result.paste(overlay_img, (position['x'], position['y']), overlay_img)
        
        # Save result
        output_path = f"/tmp/output_{uuid.uuid4()}.png"
        result.save(output_path, 'PNG')
        
        return output_path
    
    def batch_apply_overlay(self, document_paths, overlay_data, position, size, pages='all'):
        """Apply overlay to multiple documents"""
        results = []
        
        for doc_path in document_paths:
            try:
                output_path = self.apply_overlay(doc_path, overlay_data, position, size, pages)
                results.append({
                    'input': doc_path,
                    'output': output_path,
                    'success': True
                })
            except Exception as e:
                results.append({
                    'input': doc_path,
                    'output': None,
                    'success': False,
                    'error': str(e)
                })
        
        return results
    
    def convert_pdf_to_images(self, pdf_path, dpi=200):
        """Convert PDF pages to images for preview"""
        try:
            from pdf2image import convert_from_path
            
            images = convert_from_path(pdf_path, dpi=dpi)
            
            # Convert to base64 for easy transmission
            image_data = []
            for i, img in enumerate(images):
                buffered = io.BytesIO()
                img.save(buffered, format='PNG')
                img_str = base64.b64encode(buffered.getvalue()).decode()
                image_data.append({
                    'page': i + 1,
                    'data': f"data:image/png;base64,{img_str}"
                })
            
            return image_data
        
        except ImportError:
            # Fallback if pdf2image is not available
            return []
        except Exception as e:
            raise Exception(f"Error converting PDF to images: {str(e)}")
    
    def merge_pdfs(self, pdf_paths, output_path=None):
        """Merge multiple PDF files into one"""
        try:
            pdf_writer = PyPDF2.PdfWriter()
            
            for pdf_path in pdf_paths:
                with open(pdf_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        pdf_writer.add_page(page)
            
            if not output_path:
                output_path = f"/tmp/merged_{uuid.uuid4()}.pdf"
            
            with open(output_path, 'wb') as output_file:
                pdf_writer.write(output_file)
            
            return output_path
        
        except Exception as e:
            raise Exception(f"Error merging PDFs: {str(e)}")
    
    def split_pdf(self, pdf_path, page_ranges):
        """
        Split a PDF into multiple files based on page ranges
        
        Args:
            pdf_path: Path to the PDF file
            page_ranges: List of tuples [(start, end), ...]
        """
        try:
            output_paths = []
            
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for i, (start, end) in enumerate(page_ranges):
                    pdf_writer = PyPDF2.PdfWriter()
                    
                    for page_num in range(start - 1, end):
                        if page_num < len(pdf_reader.pages):
                            pdf_writer.add_page(pdf_reader.pages[page_num])
                    
                    output_path = f"/tmp/split_{i}_{uuid.uuid4()}.pdf"
                    with open(output_path, 'wb') as output_file:
                        pdf_writer.write(output_file)
                    
                    output_paths.append(output_path)
            
            return output_paths
        
        except Exception as e:
            raise Exception(f"Error splitting PDF: {str(e)}")
