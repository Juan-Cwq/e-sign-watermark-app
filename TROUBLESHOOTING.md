# 🔧 Troubleshooting Guide

## "Storage quota exceeded" Error

### Symptoms:
- Error when trying to save signatures/watermarks
- Message: "Failed to save: Storage quota exceeded"
- Library appears empty but still can't save

### Causes:
1. **Browser localStorage is full** (~5-10MB limit)
2. **Leftover data** from previous sessions
3. **Large images** taking up too much space

### Solutions:

#### Option 1: Clear All Data (Fastest)
1. Open browser console (Press `F12` or `Cmd+Option+I` on Mac)
2. Type: `localStorage.clear()`
3. Press Enter
4. Refresh the page (`Cmd+R` or `F5`)
5. Try saving again

#### Option 2: Use the Dashboard
1. Go to **Dashboard**
2. If storage is nearly full, you'll see a warning
3. Click **"clear all data"** button
4. Confirm the action

#### Option 3: Delete Items from Library
1. Go to **Library** page
2. Delete old signatures/watermarks you don't need
3. Try saving again

#### Option 4: Check Storage Usage
Open browser console (`F12`) and run:
```javascript
// Check total storage
let total = 0;
for(let key in localStorage) {
  if(localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length + key.length;
  }
}
console.log(`Storage: ${(total / 1024 / 1024).toFixed(2)} MB`);

// Check SignaturePro data
console.log('Signatures:', localStorage.getItem('signaturepro_signatures')?.length || 0);
console.log('Watermarks:', localStorage.getItem('signaturepro_watermarks')?.length || 0);
```

---

## Watermark Creation Fails

### Symptoms:
- "Failed to create watermark" error
- No preview appears

### Solutions:

#### For Text Watermarks:
1. Make sure text field is not empty
2. Try a shorter text (max 50 characters)
3. Refresh the page and try again

#### For Image Watermarks:
1. Use smaller images (<2MB)
2. Supported formats: PNG, JPG, JPEG
3. Try compressing the image first

---

## Signature Processing Issues

### Symptoms:
- Signature doesn't process correctly
- Background not removed properly
- Image looks distorted

### Solutions:

1. **Use Better Source Images**:
   - ✅ White or light background
   - ✅ Good lighting
   - ✅ Dark pen/marker
   - ✅ High contrast
   - ❌ Avoid shadows
   - ❌ Avoid colored backgrounds

2. **Image Format**:
   - Supported: PNG, JPG, JPEG
   - Max size: ~5MB
   - Recommended: < 2MB

3. **Try Again**:
   - Upload a different photo
   - Use better lighting
   - Crop the image before uploading

---

## Can't Download Items

### Symptoms:
- Download button doesn't work
- File doesn't download

### Solutions:

1. **Check Browser Permissions**:
   - Allow downloads in browser settings
   - Check if pop-ups are blocked

2. **Try Different Browser**:
   - Chrome, Firefox, Safari, Edge all work
   - Some browsers may block automatic downloads

3. **Manual Download**:
   - Right-click the preview image
   - Select "Save image as..."

---

## Library Items Don't Load

### Symptoms:
- Library shows "No items saved"
- But you know you saved items

### Solutions:

1. **Check Browser**:
   - Are you using the same browser?
   - localStorage is per-browser

2. **Check Incognito/Private Mode**:
   - Private browsing doesn't save data
   - Use normal mode

3. **Check Console for Errors**:
   - Press `F12`
   - Look for red errors
   - Share errors if asking for help

---

## App Won't Load / White Screen

### Symptoms:
- Blank white screen
- App doesn't appear

### Solutions:

1. **Hard Refresh**:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Clear Browser Cache**:
   - Go to browser settings
   - Clear cache and cookies
   - Reload the page

3. **Check Console**:
   - Press `F12`
   - Look for errors in Console tab
   - Look for failed network requests in Network tab

4. **Try Different Browser**:
   - Chrome, Firefox, Safari, Edge

---

## Performance Issues

### Symptoms:
- App is slow
- Processing takes too long
- Browser freezes

### Solutions:

1. **Use Smaller Images**:
   - Resize images before uploading
   - Keep under 2MB

2. **Clear Old Data**:
   - Delete unused signatures/watermarks
   - Free up storage space

3. **Close Other Tabs**:
   - Free up browser memory
   - Close unused tabs

4. **Update Browser**:
   - Use latest browser version
   - Clear cache

---

## Need More Help?

### Debug Information to Collect:

1. **Browser Info**:
   - Browser name and version
   - Operating system

2. **Console Errors**:
   - Press `F12`
   - Copy any red errors
   - Screenshot if needed

3. **Storage Info**:
   ```javascript
   // Run in console
   console.log('Storage:', localStorage.length, 'items');
   console.log('Size:', 
     Object.keys(localStorage).reduce((t,k) => 
       t + localStorage[k].length + k.length, 0
     ) / 1024, 'KB'
   );
   ```

4. **Steps to Reproduce**:
   - What were you trying to do?
   - What happened instead?
   - Can you reproduce it?

---

## Quick Fixes Checklist

- [ ] Hard refresh the page (`Cmd+Shift+R` / `Ctrl+Shift+R`)
- [ ] Clear browser cache
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Try incognito/private mode
- [ ] Try different browser
- [ ] Check browser console for errors (`F12`)
- [ ] Use smaller images (<2MB)
- [ ] Delete old items from library

---

## Emergency Reset

If nothing works, do a complete reset:

```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

This will delete ALL data and reload the app fresh.
