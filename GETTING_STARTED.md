# Getting Started with SignaturePro

## 🎯 What You've Built

A professional-grade signature digitization and watermark creation application with:

✅ **AI-Powered Signature Processing** - Automatic background removal, noise reduction, edge smoothing
✅ **Custom Watermark Creator** - Text and image watermarks with full customization
✅ **Document Editor** - Apply signatures/watermarks to PDFs and images
✅ **Secure Library Management** - Encrypted storage for all your assets
✅ **Modern, Responsive UI** - Beautiful interface that works on all devices
✅ **Batch Processing** - Handle multiple documents at once
✅ **Multiple Export Formats** - PNG, JPG, SVG support

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

Open your terminal in the project folder and run:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node dependencies
npm install
```

### Step 2: Set Up Environment

```bash
# Copy the environment template
cp .env.example .env

# The default values will work for development
# For production, generate secure keys (see README)
```

### Step 3: Start the Application

**Terminal 1 - Backend:**
```bash
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 4: Open Your Browser

Navigate to: **http://localhost:3000**

## 📱 Using the Application

### 1️⃣ Digitize Your First Signature

1. Click **"Signature Digitizer"** in the sidebar
2. Drag & drop a photo of your signature (or click to browse)
3. Watch as AI automatically processes it:
   - Removes background
   - Crops to bounds
   - Enhances quality
4. Give it a name and click **"Save to Library"**
5. Download in PNG or JPG format

### 2️⃣ Create a Custom Watermark

1. Click **"Watermark Creator"** in the sidebar
2. Choose **Text** or **Image** watermark
3. For text:
   - Type your text (or use a preset template)
   - Adjust size, color, opacity, rotation
4. Click **"Create Watermark"**
5. Save to library or download

### 3️⃣ Apply to Documents

1. Click **"Document Editor"** in the sidebar
2. Upload a PDF or image document
3. Select a signature or watermark from your library
4. Drag it to position on the document
5. Adjust size with the sliders
6. Click **"Apply & Download"**

### 4️⃣ Manage Your Library

1. Click **"Library"** in the sidebar
2. View all saved signatures and watermarks
3. Download or delete items as needed

## 🎨 Features Breakdown

### Signature Digitizer
- **AI Background Removal**: Uses rembg (machine learning) for perfect results
- **Smart Cropping**: Automatically finds signature bounds with padding
- **Image Enhancement**: Bilateral filtering, Gaussian smoothing, contrast enhancement
- **Multi-Format Export**: PNG (transparent), JPG (white background)

### Watermark Creator
- **Text Watermarks**: 
  - 6 preset templates (CONFIDENTIAL, DRAFT, COPY, etc.)
  - Custom font size (20-120px)
  - Full color picker
  - Opacity control (0-100%)
  - Rotation (0-360°)
- **Image Watermarks**:
  - Upload any logo or image
  - Opacity and rotation controls
  - Automatic resizing

### Document Editor
- **Supported Formats**: PDF, PNG, JPG, JPEG
- **Drag & Drop Positioning**: Intuitive placement
- **Size Controls**: Precise width/height adjustment
- **Real-Time Preview**: See before you apply
- **Batch Processing**: Apply to multiple pages

### Security Features
- **Encryption**: All stored data is encrypted using Fernet
- **File Validation**: Magic byte checking for security
- **Sanitized Inputs**: Protection against attacks
- **Local Storage**: No cloud dependency by default

## 🔧 Troubleshooting

### Backend Won't Start
```bash
# Make sure you're in the virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Won't Start
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
```

### Image Processing Errors
```bash
# The rembg library downloads AI models on first use
# This may take a few minutes - be patient!
# Make sure you have a stable internet connection
```

### Port Already in Use
```bash
# Backend (port 5000)
# Kill the process using port 5000
lsof -ti:5000 | xargs kill -9

# Frontend (port 3000)
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

## 📊 Project Structure

```
📦 SignaturePro
├── 🐍 Backend (Flask)
│   ├── app.py                    # Main API server
│   └── utils/
│       ├── image_processor.py    # Signature processing
│       ├── watermark_creator.py  # Watermark generation
│       ├── document_handler.py   # PDF/image handling
│       └── security.py           # Encryption & security
│
├── ⚛️ Frontend (React)
│   ├── src/
│   │   ├── pages/               # Main application pages
│   │   ├── components/          # Reusable UI components
│   │   └── App.jsx             # Main app component
│   └── index.html              # Entry point
│
├── 💾 Storage
│   ├── uploads/                # Temporary uploads
│   └── storage/                # Persistent storage
│       ├── signatures/         # Saved signatures
│       └── watermarks/         # Saved watermarks
│
└── 📄 Configuration
    ├── requirements.txt        # Python packages
    ├── package.json           # Node packages
    └── .env                   # Environment variables
```

## 🎓 Tips for Best Results

### Signature Photos
- ✅ Use white or light paper
- ✅ Good lighting (natural light is best)
- ✅ Dark pen or marker
- ✅ Clear, focused image
- ❌ Avoid shadows
- ❌ Avoid reflections
- ❌ Don't use lined paper

### Watermarks
- Use high contrast colors for visibility
- Test opacity levels (0.3-0.5 works well)
- 45° rotation is standard for diagonal watermarks
- Keep text concise for better readability

### Documents
- PDFs work best for professional documents
- Images are great for quick signatures
- Always preview before applying
- Keep originals - download creates new files

## 🚀 Next Steps

1. **Customize the UI**: Edit the CSS files to match your brand
2. **Add More Templates**: Extend the watermark templates in `WatermarkCreator.jsx`
3. **Cloud Integration**: Add Google Drive or Dropbox support
4. **Mobile App**: Build iOS/Android versions
5. **API Access**: Expose endpoints for third-party integrations

## 📞 Need Help?

- 📖 Check the full **README.md** for detailed documentation
- 🐛 Found a bug? Check the console for error messages
- 💡 Want a feature? Add it to the roadmap!

## 🎉 You're All Set!

Your professional signature digitization and watermark tool is ready to use. Start by digitizing your first signature and see the AI magic in action!

---

**Happy Signing! ✍️**
