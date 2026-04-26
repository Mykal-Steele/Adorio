interface NetworkInformation {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface NavigatorExtended extends Navigator {
  deviceMemory?: number;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
  connection?: NetworkInformation;
  buildID?: string;
  oscpu?: string;
}

let fingerprintCache = null;
let fingerprintPromise = null;

const getCanvasFingerprint = () => {
  try {
    if (!document.createElement || !HTMLCanvasElement) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = 280;
    canvas.height = 60;

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
    if (process.env.NODE_ENV === 'development') {
      console.warn('Canvas fingerprinting failed:', error);
    }
    return null;
  }
};

const getWebGLFingerprint = () => {
  try {
    if (!HTMLCanvasElement || !WebGLRenderingContext) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl') ||
      canvas.getContext('webgl2')) as WebGLRenderingContext | null;

    if (!gl) return null;

    const result: Record<string, unknown> = {
      version: gl.getParameter(gl.VERSION),
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
    };

    try {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        result.unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        result.unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    } catch (debugError) {}

    result.extensions = gl.getSupportedExtensions() || [];

    return result;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('WebGL fingerprinting failed:', error);
    }
    return null;
  }
};

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

    document.body.appendChild(canvas);

    try {
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
            } catch (measureError) {}
          });
          if (detected) {
            availableFonts.push(font);
          }
        } catch (fontTestError) {}
      });

      return availableFonts;
    } finally {
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

const getBrowserFingerprint = async () => {
  try {
    const [canvas, webgl, fonts] = await Promise.all([
      Promise.resolve(getCanvasFingerprint()),
      Promise.resolve(getWebGLFingerprint()),
      Promise.resolve(getAvailableFonts()),
    ]);

    const fingerprint: Record<string, unknown> = {
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
      buildID: (navigator as NavigatorExtended).buildID || '',
      oscpu: (navigator as NavigatorExtended).oscpu || '',
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
        extensions: Array.isArray(webgl.extensions) ? webgl.extensions.slice(0, 20) : [],
      };
    }

    const nav = navigator as NavigatorExtended;

    if (nav.deviceMemory) {
      fingerprint.deviceMemory = nav.deviceMemory;
    }

    if (nav.connection) {
      const conn = nav.connection;
      fingerprint.connection = {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
      };
    }

    return fingerprint;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Browser fingerprinting failed:', error);
    }
    return {
      userAgent: navigator.userAgent || '',
      platform: navigator.platform || '',
      language: navigator.language || '',
      error: 'fingerprinting_failed',
    };
  }
};

const getNetworkFingerprint = () => {
  const nav = navigator as NavigatorExtended;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (!connection) return null;

  return {
    connectionType: connection.type,
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
};

const getBehaviorFingerprint = () => {
  const seed = `${navigator.userAgent || ''}|${navigator.language || ''}|${Date.now()}`;

  return {
    mouseMovement: seed.slice(0, 16),
    keyboardTiming: seed.slice(8, 24),
    scrollPattern: seed.slice(4, 20),
  };
};

export const generateBrowserFingerprint = async () => {
  if (fingerprintCache && Date.now() - fingerprintCache.timestamp < 300000) {
    return fingerprintCache;
  }

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
        version: '2.0',
      };

      fingerprintCache = fingerprint;
      return fingerprint;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Fingerprint generation failed:', error);
      }
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
      fingerprintPromise = null;
    }
  })();

  return fingerprintPromise;
};

export const generateSessionId = () => {
  let sessionId = sessionStorage.getItem('adorio_session_id');

  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    sessionStorage.setItem('adorio_session_id', sessionId);
  }

  return sessionId;
};

export const bypassTrackingBlockers = () => {
  return {
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    indexedDB: !!window.indexedDB,
    webSQL: 'openDatabase' in window,
  };
};

export const generateVisitorId = async () => {
  try {
    const fingerprint = await generateBrowserFingerprint();
    const storageCapabilities = bypassTrackingBlockers();

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

    return {
      persistentId: `fallback-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      sessionId: `session-${Date.now()}`,
      fingerprint: null,
      storageCapabilities: null,
      error: 'id_generation_failed',
    };
  }
};

const getPersistentId = async () => {
  const storageKeys = ['adorio_persistent_id', 'adorio_visitor_id', 'visitor_identifier'];

  try {
    for (const key of storageKeys) {
      const id = localStorage.getItem(key);
      if (id) return id;
    }
  } catch (e) {}

  try {
    for (const key of storageKeys) {
      const id = sessionStorage.getItem(key);
      if (id) {
        try {
          localStorage.setItem('adorio_persistent_id', id);
        } catch (e) {}
        return id;
      }
    }
  } catch (e) {}

  try {
    const id = await getFromIndexedDB('adorio_visitor_store', 'persistent_id');
    if (id) {
      try {
        localStorage.setItem('adorio_persistent_id', id);
      } catch (e) {}
      return id;
    }
  } catch (e) {}

  return null;
};

const createPersistentId = async () => {
  const id = `${Date.now()}-${Math.random().toString(36).substring(2)}-${performance.now()}`;

  try {
    localStorage.setItem('adorio_persistent_id', id);
  } catch (e) {}

  try {
    sessionStorage.setItem('adorio_persistent_id', id);
  } catch (e) {}

  try {
    await storeInIndexedDB('adorio_visitor_store', 'persistent_id', id);
  } catch (e) {}

  return id;
};

const getFromIndexedDB = (storeName: string, key: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('AdorioAnalytics', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };

      request.onsuccess = () => {
        const db = request.result;
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

const storeInIndexedDB = (storeName: string, key: string, value: string) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const request = indexedDB.open('AdorioAnalytics', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };

      request.onsuccess = () => {
        const db = request.result;
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
