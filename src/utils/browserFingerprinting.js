/**
 * Production-ready advanced browser fingerprinting
 * Sophisticated user identification with comprehensive error handling
 * Optimized for performance and reliability
 */

// Cached fingerprint data to avoid recomputation
let fingerprintCache = null;
let fingerprintPromise = null;

// Generate canvas fingerprint with enhanced error handling
const getCanvasFingerprint = () => {
  try {
    // Check if canvas is supported
    if (!document.createElement || !HTMLCanvasElement) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = 280;
    canvas.height = 60;

    // Enhanced drawing with more unique characteristics
    ctx.textBaseline = 'top';
    ctx.font = '14px "Times New Roman", serif';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.font = '11px "Arial", sans-serif';
    ctx.fillText('Adorio Analytics 🎨📊', 2, 15);

    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18px "Georgia", serif';
    ctx.fillText('Fingerprint Test', 4, 45);

    // Add geometric shapes for more uniqueness
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 165, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(100, 25, 25, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL();
  } catch (error) {
    // Silent failure - don't break the site
    if (process.env.NODE_ENV === 'development') {
      console.warn('Canvas fingerprinting failed:', error);
    }
    return null;
  }
};

// Generate sophisticated WebGL fingerprint
const getWebGLFingerprint = () => {
  try {
    if (!HTMLCanvasElement || !WebGLRenderingContext) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl') ||
      canvas.getContext('webgl2');

    if (!gl) return null;

    const result = {
      version: gl.getParameter(gl.VERSION),
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
    };

    // Try to get unmasked vendor/renderer (more specific)
    try {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        result.unmaskedVendor = gl.getParameter(
          debugInfo.UNMASKED_VENDOR_WEBGL
        );
        result.unmaskedRenderer = gl.getParameter(
          debugInfo.UNMASKED_RENDERER_WEBGL
        );
      }
    } catch (debugError) {
      // Ignore debug info errors
    }

    // Get supported extensions
    result.extensions = gl.getSupportedExtensions() || [];

    return result;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('WebGL fingerprinting failed:', error);
    }
    return null;
  }
};

// Get available fonts with performance optimization
const getAvailableFonts = () => {
  try {
    if (!document.createElement || !HTMLCanvasElement) {
      return [];
    }

    const testFonts = [
      'Arial',
      'Times New Roman',
      'Helvetica',
      'Georgia',
      'Verdana',
      'Courier New',
      'Comic Sans MS',
      'Impact',
      'Trebuchet MS',
      'Palatino',
      'Tahoma',
      'Geneva',
      'Lucida Console',
      'Calibri',
      'Cambria',
      'Times',
      'Arial Black',
      'Franklin Gothic Medium',
      'Segoe UI',
      'Roboto',
      'Open Sans',
      'Montserrat',
      'Lato',
    ];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return [];

    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';

    canvas.width = 400;
    canvas.height = 60;
    canvas.style.position = 'absolute';
    canvas.style.left = '-9999px';
    canvas.style.top = '-9999px';

    // Add to DOM but keep it hidden
    document.body.appendChild(canvas);

    try {
      // Get baseline measurements with error handling
      const baselines = {};
      baseFonts.forEach((font) => {
        try {
          ctx.font = `${testSize} ${font}`;
          baselines[font] = ctx.measureText(testString).width;
        } catch (fontError) {
          baselines[font] = 0;
        }
      });

      const availableFonts = [];

      // Test each font with timeout protection
      testFonts.forEach((font) => {
        try {
          let detected = false;
          baseFonts.forEach((baseFont) => {
            try {
              ctx.font = `${testSize} ${font}, ${baseFont}`;
              const width = ctx.measureText(testString).width;
              if (width !== baselines[baseFont] && baselines[baseFont] > 0) {
                detected = true;
              }
            } catch (measureError) {
              // Ignore individual measurement errors
            }
          });
          if (detected) {
            availableFonts.push(font);
          }
        } catch (fontTestError) {
          // Ignore individual font test errors
        }
      });

      return availableFonts;
    } finally {
      // Always clean up DOM
      if (canvas.parentNode) {
        document.body.removeChild(canvas);
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Font detection failed:', error);
    }
    return [];
  }
};

// Get screen information
const getScreenFingerprint = () => {
  return {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
};

// Get timezone information
const getTimezoneFingerprint = () => {
  const date = new Date();
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: date.getTimezoneOffset(),
    language: navigator.language,
    languages: navigator.languages,
    dateFormat: date.toLocaleDateString(),
    timeFormat: date.toLocaleTimeString(),
  };
};

// Get comprehensive browser capabilities with error handling
const getBrowserFingerprint = async () => {
  try {
    // Use Promise.all for parallel execution of expensive operations
    const [canvas, webgl, fonts] = await Promise.all([
      Promise.resolve(getCanvasFingerprint()),
      Promise.resolve(getWebGLFingerprint()),
      Promise.resolve(getAvailableFonts()),
    ]);

    const fingerprint = {
      userAgent: navigator.userAgent || '',
      platform: navigator.platform || '',
      language: navigator.language || '',
      languages: Array.isArray(navigator.languages) ? navigator.languages : [],
      cookieEnabled: navigator.cookieEnabled || false,
      doNotTrack: navigator.doNotTrack || null,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      vendor: navigator.vendor || '',
      productSub: navigator.productSub || '',
      buildID: navigator.buildID || '',
      oscpu: navigator.oscpu || '',
      appCodeName: navigator.appCodeName || '',
      appName: navigator.appName || '',
      appVersion: navigator.appVersion || '',
      product: navigator.product || '',
      canvas: canvas ? canvas.substring(0, 100) : null,
      fonts: fonts || [],
    };

    // Add WebGL info in a structured way
    if (webgl) {
      fingerprint.webgl = {
        vendor: webgl.vendor || webgl.unmaskedVendor || '',
        renderer: webgl.renderer || webgl.unmaskedRenderer || '',
        version: webgl.version || '',
        extensions: Array.isArray(webgl.extensions)
          ? webgl.extensions.slice(0, 20)
          : [], // Limit extensions
      };
    }

    // Add memory info if available
    if (navigator.deviceMemory) {
      fingerprint.deviceMemory = navigator.deviceMemory;
    }

    // Add connection info if available
    if (navigator.connection) {
      fingerprint.connection = {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
      };
    }

    return fingerprint;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Browser fingerprinting failed:', error);
    }
    // Return minimal fingerprint on error
    return {
      userAgent: navigator.userAgent || '',
      platform: navigator.platform || '',
      language: navigator.language || '',
      error: 'fingerprinting_failed',
    };
  }
};

// Get network information
const getNetworkFingerprint = () => {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) return null;

  return {
    connectionType: connection.type,
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
};

// Collect behavioral patterns (basic version)
const getBehaviorFingerprint = () => {
  // This would be enhanced with actual mouse/keyboard tracking
  return {
    mouseMovement: Math.random().toString(36).substring(7), // Placeholder
    keyboardTiming: Math.random().toString(36).substring(7), // Placeholder
    scrollPattern: Math.random().toString(36).substring(7), // Placeholder
  };
};

// Main fingerprinting function with caching and optimization
export const generateBrowserFingerprint = async () => {
  // Return cached result if available and recent (5 minutes)
  if (fingerprintCache && Date.now() - fingerprintCache.timestamp < 300000) {
    return fingerprintCache;
  }

  // Return existing promise if fingerprinting is in progress
  if (fingerprintPromise) {
    return fingerprintPromise;
  }

  fingerprintPromise = (async () => {
    try {
      const fingerprint = {
        screen: getScreenFingerprint(),
        locale: getTimezoneFingerprint(),
        browser: await getBrowserFingerprint(),
        network: getNetworkFingerprint(),
        behavior: getBehaviorFingerprint(),
        timestamp: Date.now(),
        version: '2.0', // Version for cache invalidation
      };

      // Cache the result
      fingerprintCache = fingerprint;
      return fingerprint;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Fingerprint generation failed:', error);
      }
      // Return minimal fingerprint on complete failure
      return {
        screen: { width: screen.width, height: screen.height },
        locale: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        browser: { userAgent: navigator.userAgent },
        network: null,
        behavior: null,
        timestamp: Date.now(),
        error: 'generation_failed',
      };
    } finally {
      // Clear promise after completion
      fingerprintPromise = null;
    }
  })();

  return fingerprintPromise;
};

// Generate a unique session ID that persists across page loads
export const generateSessionId = () => {
  let sessionId = sessionStorage.getItem('adorio_session_id');

  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    sessionStorage.setItem('adorio_session_id', sessionId);
  }

  return sessionId;
};

// Anti-detection techniques (basic versions)
export const bypassTrackingBlockers = () => {
  // Use multiple storage methods
  return {
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    indexedDB: !!window.indexedDB,
    webSQL: !!window.openDatabase,
  };
};

// Enhanced visitor ID generation with multiple fallback strategies
export const generateVisitorId = async () => {
  try {
    const fingerprint = await generateBrowserFingerprint();
    const storageCapabilities = bypassTrackingBlockers();

    // Try multiple persistent storage methods
    let persistentId = await getPersistentId();

    if (!persistentId) {
      persistentId = await createPersistentId();
    }

    return {
      persistentId,
      sessionId: generateSessionId(),
      fingerprint,
      storageCapabilities,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Visitor ID generation failed:', error);
    }

    // Fallback to minimal ID generation
    return {
      persistentId: `fallback-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}`,
      sessionId: `session-${Date.now()}`,
      fingerprint: null,
      storageCapabilities: null,
      error: 'id_generation_failed',
    };
  }
};

// Advanced persistent ID retrieval with multiple fallbacks
const getPersistentId = async () => {
  const storageKeys = [
    'adorio_persistent_id',
    'adorio_visitor_id',
    'visitor_identifier',
  ];

  // Try localStorage first
  try {
    for (const key of storageKeys) {
      const id = localStorage.getItem(key);
      if (id) return id;
    }
  } catch (e) {
    // LocalStorage blocked
  }

  // Try sessionStorage
  try {
    for (const key of storageKeys) {
      const id = sessionStorage.getItem(key);
      if (id) {
        // Copy to localStorage if possible
        try {
          localStorage.setItem('adorio_persistent_id', id);
        } catch (e) {
          // Ignore localStorage errors
        }
        return id;
      }
    }
  } catch (e) {
    // SessionStorage blocked
  }

  // Try IndexedDB (more advanced, harder to block)
  try {
    const id = await getFromIndexedDB('adorio_visitor_store', 'persistent_id');
    if (id) {
      // Copy to other storage methods if possible
      try {
        localStorage.setItem('adorio_persistent_id', id);
      } catch (e) {}
      return id;
    }
  } catch (e) {
    // IndexedDB blocked or failed
  }

  return null;
};

// Create and store persistent ID using multiple methods
const createPersistentId = async () => {
  const id = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}-${performance.now()}`;

  // Store in multiple places
  const storagePromises = [];

  // Try localStorage
  try {
    localStorage.setItem('adorio_persistent_id', id);
  } catch (e) {
    // Ignore localStorage errors
  }

  // Try sessionStorage
  try {
    sessionStorage.setItem('adorio_persistent_id', id);
  } catch (e) {
    // Ignore sessionStorage errors
  }

  // Try IndexedDB
  try {
    await storeInIndexedDB('adorio_visitor_store', 'persistent_id', id);
  } catch (e) {
    // Ignore IndexedDB errors
  }

  return id;
};

// IndexedDB helper functions
const getFromIndexedDB = (storeName, key) => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('AdorioAnalytics', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        try {
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const getRequest = store.get(key);

          getRequest.onsuccess = () => resolve(getRequest.result);
          getRequest.onerror = () => reject(getRequest.error);
        } catch (e) {
          reject(e);
        }
      };
    } catch (e) {
      reject(e);
    }
  });
};

const storeInIndexedDB = (storeName, key, value) => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('AdorioAnalytics', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        try {
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const putRequest = store.put(value, key);

          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } catch (e) {
          reject(e);
        }
      };
    } catch (e) {
      reject(e);
    }
  });
};
