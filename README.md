# SignaturePro - Professional Signature Digitization & Watermark Tool

A comprehensive, secure, and professional solution for converting handwritten signatures into digital assets and creating custom watermarks for documents. Built for business professionals, legal practitioners, and anyone requiring secure document handling.

![SignaturePro](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### Signature Digitization
- **AI-Powered Processing**: Advanced background removal using machine learning
- **High-Quality Output**: Export in PNG, JPG, and SVG formats
- **Smart Cropping**: Automatic detection and cropping of signature bounds
- **Image Enhancement**: Noise reduction, edge smoothing, and contrast enhancement
- **Signature Library**: Securely store and manage multiple signatures

### Custom Watermark Creator
- **Text Watermarks**: Customizable font, size, color, opacity, and rotation
- **Image Watermarks**: Upload logos or images with full customization
- **Preset Templates**: Quick access to common watermarks (CONFIDENTIAL, DRAFT, etc.)
- **Watermark Library**: Save and reuse frequently used watermarks

### Document Integration
- **Multi-Format Support**: Works with PDF, PNG, JPG, and JPEG files
- **Drag & Drop Placement**: Intuitive interface for precise positioning
- **Real-Time Preview**: See changes before applying
- **Batch Processing**: Apply watermarks to multiple documents at once
- **Secure Export**: Download processed documents with integrity protection

### Security & Privacy
- **End-to-End Encryption**: All stored signatures and documents are encrypted
- **Secure Storage**: Industry-standard encryption for sensitive data
- **No Cloud Dependency**: Run entirely on your local machine
- **GDPR Compliant**: Built with data privacy regulations in mind

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd signature-watermark-app
```

2. **Set up the backend**
```bash
# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

3. **Set up the frontend**
```bash
# Install Node dependencies
npm install
```

4. **Configure environment variables**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your configuration
# Generate a secure secret key for Flask
# Generate an encryption key for data security
```

5. **Run the application**

In one terminal, start the backend:
```bash
python app.py
```

In another terminal, start the frontend:
```bash
npm run dev
```

6. **Access the application**
Open your browser and navigate to `http://localhost:3000`

## 📖 Usage Guide

### Digitizing a Signature

1. Navigate to **Signature Digitizer**
2. Upload a photo of your handwritten signature
3. The AI will automatically:
   - Remove the background
   - Crop to signature bounds
   - Enhance quality and contrast
   - Smooth edges
4. Review the processed signature
5. Save to your library or download in your preferred format

**Tips for Best Results:**
- Use a white or light-colored background
- Ensure good lighting
- Sign with a dark pen or marker
- Avoid shadows and reflections

### Creating a Watermark

1. Navigate to **Watermark Creator**
2. Choose between Text or Image watermark
3. For Text Watermarks:
   - Enter your text
   - Choose from preset templates or customize
   - Adjust font size, color, opacity, and rotation
4. For Image Watermarks:
   - Upload your logo or image
   - Adjust opacity and rotation
5. Preview your watermark
6. Save to library or download

### Applying to Documents

1. Navigate to **Document Editor**
2. Upload your document (PDF or image)
3. Select a signature or watermark from your library
4. Drag and position the overlay on the document
5. Adjust size using the controls
6. Click "Apply & Download" to get your signed document

### Managing Your Library

1. Navigate to **Library**
2. View all saved signatures and watermarks
3. Download any item for use in other applications
4. Delete items you no longer need

## 🏗️ Architecture

### Backend (Flask)
- **app.py**: Main Flask application with API endpoints
- **utils/image_processor.py**: Advanced image processing for signatures
- **utils/watermark_creator.py**: Watermark generation and customization
- **utils/document_handler.py**: PDF and image document manipulation
- **utils/security.py**: Encryption and security features

### Frontend (React)
- **Modern UI**: Built with React and Vite
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Component-Based**: Modular and maintainable code structure
- **Real-Time Updates**: Instant feedback on all operations

## 🔒 Security Features

- **Encryption at Rest**: All stored signatures and watermarks are encrypted
- **Secure File Handling**: Validation of file types and magic bytes
- **No External Dependencies**: Runs entirely on your infrastructure
- **Sanitized Inputs**: Protection against injection attacks
- **Rate Limiting**: Protection against abuse (configurable)

## 🛠️ Technology Stack

### Backend
- Flask 3.0
- Pillow (PIL) for image processing
- OpenCV for advanced image operations
- rembg for AI-powered background removal
- PyPDF2 & ReportLab for PDF handling
- Cryptography for encryption

### Frontend
- React 18
- Vite for fast development
- React Router for navigation
- Axios for API calls
- React Dropzone for file uploads
- React Draggable for positioning
- React Color for color picking
- Lucide React for icons

## 📁 Project Structure

```
signature-watermark-app/
├── app.py                  # Flask backend
├── requirements.txt        # Python dependencies
├── package.json           # Node dependencies
├── vite.config.js         # Vite configuration
├── index.html             # HTML entry point
├── .env.example           # Environment variables template
├── utils/                 # Backend utilities
│   ├── image_processor.py
│   ├── watermark_creator.py
│   ├── document_handler.py
│   └── security.py
├── src/                   # Frontend source
│   ├── main.jsx          # React entry point
│   ├── App.jsx           # Main App component
│   ├── components/       # Reusable components
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   └── pages/            # Page components
│       ├── Dashboard.jsx
│       ├── SignatureDigitizer.jsx
│       ├── WatermarkCreator.jsx
│       ├── DocumentEditor.jsx
│       └── Library.jsx
├── uploads/              # Temporary upload storage
└── storage/              # Persistent storage
    ├── signatures/
    └── watermarks/
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
FLASK_SECRET_KEY=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
FLASK_ENV=development
FLASK_DEBUG=1
MAX_CONTENT_LENGTH=16777216
UPLOAD_FOLDER=uploads
STORAGE_FOLDER=storage
```

### Generating Secure Keys

```python
# Generate a secure secret key
import secrets
print(secrets.token_hex(32))

# Generate an encryption key
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

## 🚢 Deployment

### Production Considerations

1. **Set production environment variables**
```env
FLASK_ENV=production
FLASK_DEBUG=0
```

2. **Use a production WSGI server**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

3. **Build the frontend**
```bash
npm run build
```

4. **Serve with a reverse proxy** (nginx, Apache, etc.)

5. **Enable HTTPS** for secure communication

6. **Set up regular backups** for the storage folder

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **rembg** for AI-powered background removal
- **Pillow** for comprehensive image processing
- **React** for the amazing frontend framework
- All open-source contributors

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] Mobile app (iOS/Android)
- [ ] Advanced PDF editing features
- [ ] Batch signature application
- [ ] API for third-party integrations
- [ ] Multi-language support
- [ ] Advanced security features (2FA, audit logs)
- [ ] Collaboration features (team libraries)

## ⚠️ Important Notes

- This application processes sensitive documents. Always ensure you're running it in a secure environment.
- Keep your encryption keys safe and never commit them to version control.
- Regularly backup your storage folder to prevent data loss.
- For production use, implement additional security measures based on your requirements.

---

**Built with ❤️ for secure document handling**
