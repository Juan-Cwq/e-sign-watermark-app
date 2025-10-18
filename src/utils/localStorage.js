// Local storage manager for signatures and watermarks
class LocalStorageManager {
  constructor() {
    this.SIGNATURES_KEY = 'signaturepro_signatures';
    this.WATERMARKS_KEY = 'signaturepro_watermarks';
  }

  // Save signature
  async saveSignature(name, blob) {
    try {
      const dataUrl = await this.blobToDataURL(blob);
      const signatures = this.getSignatures();
      
      const signature = {
        id: Date.now().toString(),
        name: name,
        data: dataUrl,
        created_at: new Date().toISOString()
      };
      
      signatures.push(signature);
      localStorage.setItem(this.SIGNATURES_KEY, JSON.stringify(signatures));
      
      return signature;
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        throw new Error('Storage quota exceeded. Please delete some items from your library.');
      }
      throw new Error('Failed to save signature: ' + error.message);
    }
  }

  // Get all signatures
  getSignatures() {
    try {
      const data = localStorage.getItem(this.SIGNATURES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load signatures:', error);
      return [];
    }
  }

  // Get signature by ID
  getSignature(id) {
    const signatures = this.getSignatures();
    return signatures.find(sig => sig.id === id);
  }

  // Delete signature
  deleteSignature(id) {
    const signatures = this.getSignatures();
    const filtered = signatures.filter(sig => sig.id !== id);
    localStorage.setItem(this.SIGNATURES_KEY, JSON.stringify(filtered));
  }

  // Save watermark
  async saveWatermark(name, blob, type = 'text') {
    try {
      const dataUrl = await this.blobToDataURL(blob);
      const watermarks = this.getWatermarks();
      
      const watermark = {
        id: Date.now().toString(),
        name: name,
        data: dataUrl,
        type: type,
        created_at: new Date().toISOString()
      };
      
      watermarks.push(watermark);
      localStorage.setItem(this.WATERMARKS_KEY, JSON.stringify(watermarks));
      
      return watermark;
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        throw new Error('Storage quota exceeded. Please delete some items from your library.');
      }
      throw new Error('Failed to save watermark: ' + error.message);
    }
  }

  // Get all watermarks
  getWatermarks() {
    try {
      const data = localStorage.getItem(this.WATERMARKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load watermarks:', error);
      return [];
    }
  }

  // Get watermark by ID
  getWatermark(id) {
    const watermarks = this.getWatermarks();
    return watermarks.find(wm => wm.id === id);
  }

  // Delete watermark
  deleteWatermark(id) {
    const watermarks = this.getWatermarks();
    const filtered = watermarks.filter(wm => wm.id !== id);
    localStorage.setItem(this.WATERMARKS_KEY, JSON.stringify(filtered));
  }

  // Helper: Convert blob to data URL
  blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Helper: Convert data URL to blob
  dataURLToBlob(dataUrl) {
    return fetch(dataUrl).then(res => res.blob());
  }

  // Clear all data
  clearAll() {
    localStorage.removeItem(this.SIGNATURES_KEY);
    localStorage.removeItem(this.WATERMARKS_KEY);
  }

  // Get storage usage
  getStorageInfo() {
    const signatures = this.getSignatures();
    const watermarks = this.getWatermarks();
    
    return {
      signatures: signatures.length,
      watermarks: watermarks.length,
      totalItems: signatures.length + watermarks.length
    };
  }
}

export default new LocalStorageManager();
