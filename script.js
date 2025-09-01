// シンプルなARアプリケーション（デバッグ版）
console.log('Script loaded successfully');

class ARApp {
    constructor() {
        console.log('ARApp constructor called');
        this.isARReady = false;
        this.init();
    }
    
    async init() {
        console.log('ARApp init started');
        try {
            console.log('Checking browser support...');
            await this.checkBrowserSupport();
            
            console.log('Requesting camera permission...');
            await this.requestCameraPermission();
            
            console.log('Setting up AR scene...');
            this.setupARScene();
            
            console.log('Hiding loading screen...');
            this.hideLoadingScreen();
        } catch (error) {
            console.error('ARApp init error:', error);
            this.handleError(error);
        }
    }
    
    // ブラウザサポート確認
    checkBrowserSupport() {
        return new Promise((resolve, reject) => {
            console.log('Checking getUserMedia support...');
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error('getUserMedia not supported');
                reject(new Error('カメラアクセスがサポートされていません'));
                return;
            }
            
            console.log('Checking A-Frame support...');
            if (!window.AFRAME) {
                console.error('A-Frame not loaded');
                reject(new Error('A-Frameが読み込まれていません'));
                return;
            }
            
            console.log('Browser support check passed');
            resolve();
        });
    }
    
    // カメラ権限要求（スマホ向け最適化）
    async requestCameraPermission() {
        try {
            console.log('Setting up camera constraints...');
            const constraints = { 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 800, max: 1280 },
                    height: { ideal: 600, max: 720 }
                } 
            };
            
            // モバイルデバイスの検出
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            console.log('Is mobile device:', isMobile);
            
            if (isMobile) {
                constraints.video = {
                    facingMode: 'environment',
                    width: { ideal: 800 },
                    height: { ideal: 600 }
                };
            }
            
            console.log('Requesting camera access with constraints:', constraints);
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Camera access granted, stopping test stream');
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Camera permission error:', error);
            throw new Error('カメラアクセスが許可されていません');
        }
    }
    
    // ARシーン設定
    setupARScene() {
        console.log('Setting up AR scene...');
        
        // シーンが完全に初期化されるまで待つ
        setTimeout(() => {
            console.log('AR scene setup timeout triggered');
            const scene = document.querySelector('a-scene');
            console.log('Scene element:', scene);
            
            if (scene) {
                const canvas = scene.canvas;
                console.log('Canvas element:', canvas);
                
                if (canvas) {
                    console.log('Applying canvas styles...');
                    // スマホ表示問題の修正
                    canvas.style.position = 'fixed';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.style.width = '100vw';
                    canvas.style.height = '100vh';
                    canvas.style.objectFit = 'cover';
                    canvas.style.zIndex = '1';
                }
                
                // ビデオ要素も修正
                const video = scene.querySelector('video');
                console.log('Video element:', video);
                if (video) {
                    console.log('Applying video styles...');
                    video.style.position = 'fixed';
                    video.style.top = '0';
                    video.style.left = '0';
                    video.style.width = '100vw';
                    video.style.height = '100vh';
                    video.style.objectFit = 'cover';
                    video.style.zIndex = '1';
                }
            }
            
            // デバイス方向変更時の対応
            window.addEventListener('orientationchange', () => {
                console.log('Orientation change detected');
                setTimeout(() => {
                    const scene = document.querySelector('a-scene');
                    if (scene) {
                        const canvas = scene.canvas;
                        const video = scene.querySelector('video');
                        
                        if (canvas) {
                            canvas.style.width = '100vw';
                            canvas.style.height = '100vh';
                        }
                        if (video) {
                            video.style.width = '100vw';
                            video.style.height = '100vh';
                        }
                    }
                    
                    // viewport高さの再計算
                    const vh = window.innerHeight * 0.01;
                    document.documentElement.style.setProperty('--vh', `${vh}px`);
                }, 500);
            });
            
            // リサイズイベントの対応
            window.addEventListener('resize', () => {
                console.log('Resize event detected');
                const scene = document.querySelector('a-scene');
                if (scene) {
                    const canvas = scene.canvas;
                    const video = scene.querySelector('video');
                    
                    if (canvas) {
                        canvas.style.width = '100vw';
                        canvas.style.height = '100vh';
                    }
                    if (video) {
                        video.style.width = '100vw';
                        video.style.height = '100vh';
                    }
                }
            });
            
        }, 1000);
    }
    
    // エラーハンドリング
    handleError(error) {
        console.error('AR App Error:', error);
        
        const errorScreen = document.getElementById('errorScreen');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorMessage) {
            errorMessage.textContent = error.message;
        }
        
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        if (errorScreen) {
            errorScreen.classList.remove('hidden');
        }
    }
    
    // ローディング画面非表示
    hideLoadingScreen() {
        console.log('Hiding loading screen...');
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            const instructionOverlay = document.getElementById('instructionOverlay');
            
            if (loadingScreen) {
                console.log('Loading screen found, hiding...');
                loadingScreen.classList.add('hidden');
            }
            
            if (instructionOverlay) {
                console.log('Instruction overlay found, showing...');
                instructionOverlay.classList.remove('hidden');
            }
        }, 2000);
    }
}

// ユーティリティ関数
function hideInstructions() {
    console.log('Hiding instructions...');
    const instructionOverlay = document.getElementById('instructionOverlay');
    if (instructionOverlay) {
        instructionOverlay.classList.add('hidden');
    }
}

function retryCamera() {
    console.log('Retrying camera...');
    window.location.reload();
}

// アプリケーション開始
console.log('Setting up DOMContentLoaded listener...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, starting AR App...');
    new ARApp();
});

// 即座に実行も試す
if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded...');
} else {
    console.log('Document already loaded, starting AR App immediately...');
    new ARApp();
}
