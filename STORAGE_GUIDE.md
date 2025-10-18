# 📦 Browser Storage Guide

Your SignaturePro app uses **browser localStorage** to save signatures and watermarks.

## 💾 Storage Limits

- **Maximum**: ~5-10MB per domain (varies by browser)
- **Current Usage**: Check the Dashboard for stats
- **Per Item**: Images are stored as base64 (larger than original)

## ⚠️ "Quota Exceeded" Error

If you see **"The quota has been exceeded"**, your localStorage is full!

### Solutions:

1. **Delete Old Items**:
   - Go to **Library** page
   - Delete signatures/watermarks you don't need
   - Each deletion frees up space

2. **Use Smaller Images**:
   - Resize images before uploading
   - Use compressed formats
   - Crop unnecessary parts

3. **Download & Delete**:
   - Download important items to your computer
   - Delete them from the library
   - Re-upload when needed

4. **Clear All Data** (Nuclear option):
   - Open browser console (F12)
   - Run: `localStorage.clear()`
   - Refreshes the page
   - ⚠️ This deletes EVERYTHING!

## 💡 Best Practices

### For Signatures:
- ✅ Upload clean, cropped signatures
- ✅ Use white background for best processing
- ✅ Keep only your most-used signatures
- ❌ Don't save every test/experiment

### For Watermarks:
- ✅ Text watermarks use minimal space
- ✅ Keep watermark images small (<500KB)
- ❌ Avoid high-resolution watermark images

## 🔍 Check Storage Usage

### In the App:
- Dashboard shows: X signatures, Y watermarks

### In Browser Console (F12):
```javascript
// Check total localStorage size
let total = 0;
for(let key in localStorage) {
  if(localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length + key.length;
  }
}
console.log(`Storage used: ${(total / 1024 / 1024).toFixed(2)} MB`);
```

## 🗑️ Manual Cleanup

### Delete Specific Items:
```javascript
// In browser console (F12)
localStorage.removeItem('signaturepro_signatures');  // Delete all signatures
localStorage.removeItem('signaturepro_watermarks');  // Delete all watermarks
```

### Clear Everything:
```javascript
localStorage.clear();  // ⚠️ Deletes ALL data
```

## 📱 Browser Differences

| Browser | Typical Limit |
|---------|---------------|
| Chrome | 10 MB |
| Firefox | 10 MB |
| Safari | 5 MB |
| Edge | 10 MB |
| Mobile | 5 MB |

## 🚀 Future Improvements

Want unlimited storage? Consider:
1. **Cloud Storage**: AWS S3, Cloudinary, Firebase
2. **IndexedDB**: Larger browser storage (50MB+)
3. **Backend Database**: PostgreSQL, MongoDB
4. **File Compression**: Reduce image sizes before storing

## 💾 Data Persistence

**Important**: Browser localStorage data:
- ✅ Persists across sessions
- ✅ Survives browser restart
- ❌ Lost if you clear browser data
- ❌ Not synced across devices
- ❌ Not synced across browsers

**Backup Important Items**: Always download critical signatures/watermarks to your computer!

---

**Need Help?** Check the browser console (F12) for detailed error messages.
