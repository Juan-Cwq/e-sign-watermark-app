from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
import json
from datetime import datetime
from dotenv import load_dotenv
from utils.image_processor import ImageProcessor
from utils.watermark_creator import WatermarkCreator
from utils.document_handler import DocumentHandler
from utils.security import SecurityManager

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['STORAGE_FOLDER'] = os.getenv('STORAGE_FOLDER', 'storage')

CORS(app)

# Initialize utilities
image_processor = ImageProcessor()
watermark_creator = WatermarkCreator()
document_handler = DocumentHandler()
security_manager = SecurityManager(os.getenv('ENCRYPTION_KEY', 'dev-encryption-key'))

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['STORAGE_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['STORAGE_FOLDER'], 'signatures'), exist_ok=True)
os.makedirs(os.path.join(app.config['STORAGE_FOLDER'], 'watermarks'), exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'svg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/signature/upload', methods=['POST'])
def upload_signature():
    """Upload and process a handwritten signature image"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400
    
    try:
        # Save uploaded file
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process the signature
        processed_data = image_processor.process_signature(filepath)
        
        # Clean up upload
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'data': processed_data
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/signature/save', methods=['POST'])
def save_signature():
    """Save a processed signature to the library"""
    try:
        data = request.json
        signature_id = str(uuid.uuid4())
        
        # Save signature data
        signature_path = os.path.join(
            app.config['STORAGE_FOLDER'], 
            'signatures', 
            f"{signature_id}.png"
        )
        
        # Decode and save the image
        image_processor.save_base64_image(data['image'], signature_path)
        
        # Save metadata
        metadata = {
            'id': signature_id,
            'name': data.get('name', 'Untitled Signature'),
            'created_at': datetime.now().isoformat(),
            'format': data.get('format', 'png')
        }
        
        metadata_path = os.path.join(
            app.config['STORAGE_FOLDER'], 
            'signatures', 
            f"{signature_id}.json"
        )
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f)
        
        return jsonify({
            'success': True,
            'signature_id': signature_id,
            'metadata': metadata
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/signature/list', methods=['GET'])
def list_signatures():
    """List all saved signatures"""
    try:
        signatures_dir = os.path.join(app.config['STORAGE_FOLDER'], 'signatures')
        signatures = []
        
        for filename in os.listdir(signatures_dir):
            if filename.endswith('.json'):
                with open(os.path.join(signatures_dir, filename), 'r') as f:
                    metadata = json.load(f)
                    signatures.append(metadata)
        
        # Sort by creation date
        signatures.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({
            'success': True,
            'signatures': signatures
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/signature/<signature_id>', methods=['GET'])
def get_signature(signature_id):
    """Get a specific signature image"""
    try:
        signature_path = os.path.join(
            app.config['STORAGE_FOLDER'], 
            'signatures', 
            f"{signature_id}.png"
        )
        
        if not os.path.exists(signature_path):
            return jsonify({'error': 'Signature not found'}), 404
        
        return send_file(signature_path, mimetype='image/png')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/signature/<signature_id>', methods=['DELETE'])
def delete_signature(signature_id):
    """Delete a signature from the library"""
    try:
        signature_path = os.path.join(
            app.config['STORAGE_FOLDER'], 
            'signatures', 
            f"{signature_id}.png"
        )
        metadata_path = os.path.join(
            app.config['STORAGE_FOLDER'], 
            'signatures', 
            f"{signature_id}.json"
        )
        
        if os.path.exists(signature_path):
            os.remove(signature_path)
        if os.path.exists(metadata_path):
            os.remove(metadata_path)
        
        return jsonify({'success': True})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/watermark/create', methods=['POST'])
def create_watermark():
    """Create a custom watermark (text or image-based)"""
    try:
        data = request.json
        watermark_type = data.get('type', 'text')
        
        if watermark_type == 'text':
            watermark_data = watermark_creator.create_text_watermark(
                text=data['text'],
                font_size=data.get('fontSize', 48),
                color=data.get('color', '#000000'),
                opacity=data.get('opacity', 0.5),
                rotation=data.get('rotation', 0)
            )
        else:
            # Image watermark
            watermark_data = watermark_creator.create_image_watermark(
                image_data=data['image'],
                opacity=data.get('opacity', 0.5),
                rotation=data.get('rotation', 0)
            )
        
        return jsonify({
            'success': True,
            'data': watermark_data
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/watermark/save', methods=['POST'])
def save_watermark():
    """Save a watermark to the library"""
    try:
        data = request.json
        watermark_id = str(uuid.uuid4())
        
        # Save watermark data
        watermark_path = os.path.join(
            app.config['STORAGE_FOLDER'], 
            'watermarks', 
            f"{watermark_id}.png"
        )
        
        image_processor.save_base64_image(data['image'], watermark_path)
        
        # Save metadata
        metadata = {
            'id': watermark_id,
            'name': data.get('name', 'Untitled Watermark'),
            'type': data.get('type', 'text'),
            'created_at': datetime.now().isoformat(),
            'settings': data.get('settings', {})
        }
        
        metadata_path = os.path.join(
            app.config['STORAGE_FOLDER'], 
            'watermarks', 
            f"{watermark_id}.json"
        )
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f)
        
        return jsonify({
            'success': True,
            'watermark_id': watermark_id,
            'metadata': metadata
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/watermark/list', methods=['GET'])
def list_watermarks():
    """List all saved watermarks"""
    try:
        watermarks_dir = os.path.join(app.config['STORAGE_FOLDER'], 'watermarks')
        watermarks = []
        
        for filename in os.listdir(watermarks_dir):
            if filename.endswith('.json'):
                with open(os.path.join(watermarks_dir, filename), 'r') as f:
                    metadata = json.load(f)
                    watermarks.append(metadata)
        
        watermarks.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({
            'success': True,
            'watermarks': watermarks
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/watermark/<watermark_id>', methods=['GET'])
def get_watermark(watermark_id):
    """Get a specific watermark image"""
    try:
        watermark_path = os.path.join(
            app.config['STORAGE_FOLDER'], 
            'watermarks', 
            f"{watermark_id}.png"
        )
        
        if not os.path.exists(watermark_path):
            return jsonify({'error': 'Watermark not found'}), 404
        
        return send_file(watermark_path, mimetype='image/png')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/watermark/<watermark_id>', methods=['DELETE'])
def delete_watermark(watermark_id):
    """Delete a watermark from the library"""
    try:
        watermark_path = os.path.join(
            app.config['STORAGE_FOLDER'], 
            'watermarks', 
            f"{watermark_id}.png"
        )
        metadata_path = os.path.join(
            app.config['STORAGE_FOLDER'], 
            'watermarks', 
            f"{watermark_id}.json"
        )
        
        if os.path.exists(watermark_path):
            os.remove(watermark_path)
        if os.path.exists(metadata_path):
            os.remove(metadata_path)
        
        return jsonify({'success': True})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/document/upload', methods=['POST'])
def upload_document():
    """Upload a document for watermarking/signing"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get document info
        doc_info = document_handler.get_document_info(filepath)
        
        return jsonify({
            'success': True,
            'document_id': filename,
            'info': doc_info
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/document/apply', methods=['POST'])
def apply_to_document():
    """Apply signature or watermark to a document"""
    try:
        data = request.json
        document_id = data['document_id']
        document_path = os.path.join(app.config['UPLOAD_FOLDER'], document_id)
        
        if not os.path.exists(document_path):
            return jsonify({'error': 'Document not found'}), 404
        
        # Apply watermark/signature
        output_path = document_handler.apply_overlay(
            document_path=document_path,
            overlay_data=data['overlay'],
            position=data.get('position', {'x': 0, 'y': 0}),
            size=data.get('size', {'width': 200, 'height': 100}),
            pages=data.get('pages', 'all')
        )
        
        return send_file(
            output_path, 
            as_attachment=True,
            download_name=f"signed_{data.get('filename', 'document.pdf')}"
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/document/batch', methods=['POST'])
def batch_process():
    """Batch process multiple documents"""
    try:
        data = request.json
        results = []
        
        for doc_id in data['document_ids']:
            document_path = os.path.join(app.config['UPLOAD_FOLDER'], doc_id)
            
            if os.path.exists(document_path):
                output_path = document_handler.apply_overlay(
                    document_path=document_path,
                    overlay_data=data['overlay'],
                    position=data.get('position', {'x': 0, 'y': 0}),
                    size=data.get('size', {'width': 200, 'height': 100}),
                    pages=data.get('pages', 'all')
                )
                results.append({
                    'document_id': doc_id,
                    'success': True,
                    'output_path': output_path
                })
            else:
                results.append({
                    'document_id': doc_id,
                    'success': False,
                    'error': 'Document not found'
                })
        
        return jsonify({
            'success': True,
            'results': results
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
