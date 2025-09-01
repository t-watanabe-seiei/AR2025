// アプリケーション初期化
class ARApp {
    constructor() {
        this.isARReady = false;
        this.marker = null;
        this.model = null;
        this.init();
    }
    
    async init() {
        try {
            await this.checkBrowserSupport();
            await this.requestCameraPermission();
            this.setupARScene();
            this.setupEventListeners();
            this.hideLoadingScreen();
        } catch (error) {
            this.handleError(error);
        }
    }
    
    // ブラウザサポート確認
    checkBrowserSupport() {
        return new Promise((resolve, reject) => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                reject(new Error('カメラアクセスがサポートされていません'));
                return;
            }
            
            if (!window.AFRAME) {
                reject(new Error('A-Frameが読み込まれていません'));
                return;
            }
            
            resolve();
        });
    }
    
    // カメラ権限要求（高解像度対応）
    async requestCameraPermission() {
        try {
            const constraints = { 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 }
                } 
            };
            
            // iOS Safari の場合の最適化
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (isIOS) {
                constraints.video = {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                };
            }
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Camera permission error:', error);
            throw new Error('カメラアクセスが許可されていません');
        }
    }
    
    // ARシーン設定
    setupARScene() {
        // シーンが完全に初期化されるまで待つ
        setTimeout(() => {
            this.marker = document.querySelector('#hiromMarker');
            this.model = document.querySelector('#interactiveModel');
            
            if (this.marker) {
                // マーカー検出イベント
                this.marker.addEventListener('markerFound', () => {
                    console.log('マーカーを検出しました');
                    this.onMarkerFound();
                });
                
                this.marker.addEventListener('markerLost', () => {
                    console.log('マーカーを見失いました');
                    this.onMarkerLost();
                });
            }
            
            // デバイス方向の変更監視
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    // iOS Safari でのレイアウト修正
                    const scene = document.querySelector('a-scene');
                    if (scene && scene.canvas) {
                        scene.canvas.style.width = '100vw';
                        scene.canvas.style.height = '100vh';
                    }
                }, 500);
            });
            
            // iOS Safari での viewport 高さ問題の対応
            const setViewportHeight = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };
            
            setViewportHeight();
            window.addEventListener('resize', setViewportHeight);
            window.addEventListener('orientationchange', () => {
                setTimeout(setViewportHeight, 500);
            });
        }, 1000);
    }
    
    // イベントリスナー設定
    setupEventListeners() {
        // ページ非表示時のクリーンアップ
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAR();
            } else {
                this.resumeAR();
            }
        });
    }
    
    // マーカー検出時の処理
    onMarkerFound() {
        // 将来的なアニメーション制御などに使用
        console.log('3Dモデルを表示中');
    }
    
    // マーカー消失時の処理
    onMarkerLost() {
        // 将来的なクリーンアップ処理などに使用
        console.log('3Dモデルを非表示');
    }
    
    // エラーハンドリング
    handleError(error) {
        console.error('AR App Error:', error);
        
        const errorScreen = document.getElementById('errorScreen');
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.textContent = error.message;
        
        document.getElementById('loadingScreen').classList.add('hidden');
        errorScreen.classList.remove('hidden');
    }
    
    // ローディング画面非表示
    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
            document.getElementById('instructionOverlay').classList.remove('hidden');
        }, 2000);
    }
    
    // AR一時停止
    pauseAR() {
        const scene = document.querySelector('a-scene');
        if (scene) {
            scene.pause();
        }
    }
    
    // AR再開
    resumeAR() {
        const scene = document.querySelector('a-scene');
        if (scene) {
            scene.play();
        }
    }
}

// ユーティリティ関数
function hideInstructions() {
    document.getElementById('instructionOverlay').classList.add('hidden');
}

function retryCamera() {
    window.location.reload();
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
    new ARApp();
});
