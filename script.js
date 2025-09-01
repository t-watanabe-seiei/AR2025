// A-Frameカスタムコンポーネント: タッチ操作
AFRAME.registerComponent('touch-controls', {
    init: function () {
        this.isDragging = false;
        this.previousTouch = { x: 0, y: 0 };
        this.pinchDistance = 0;
        this.initialScale = this.el.getAttribute('scale');
        
        // タッチイベントリスナー
        this.el.sceneEl.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.el.sceneEl.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.el.sceneEl.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // マウスイベント（デスクトップ用）
        this.el.sceneEl.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.el.sceneEl.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.el.sceneEl.addEventListener('mouseup', this.onMouseUp.bind(this));
    },
    
    onTouchStart: function (event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            // 単指タッチ: 回転開始
            this.isDragging = true;
            this.previousTouch = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        } else if (event.touches.length === 2) {
            // 二指タッチ: ピンチズーム開始
            this.pinchDistance = this.getPinchDistance(event.touches);
        }
    },
    
    onTouchMove: function (event) {
        event.preventDefault();
        if (event.touches.length === 1 && this.isDragging) {
            // 単指ドラッグ: モデル回転
            const deltaX = event.touches[0].clientX - this.previousTouch.x;
            const deltaY = event.touches[0].clientY - this.previousTouch.y;
            
            this.rotateModel(deltaX, deltaY);
            
            this.previousTouch = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        } else if (event.touches.length === 2) {
            // 二指ピンチ: スケール変更
            const currentPinchDistance = this.getPinchDistance(event.touches);
            const scaleRatio = currentPinchDistance / this.pinchDistance;
            
            this.scaleModel(scaleRatio);
            this.pinchDistance = currentPinchDistance;
        }
    },
    
    onTouchEnd: function (event) {
        this.isDragging = false;
    },
    
    onMouseDown: function (event) {
        this.isDragging = true;
        this.previousTouch = {
            x: event.clientX,
            y: event.clientY
        };
    },
    
    onMouseMove: function (event) {
        if (this.isDragging) {
            const deltaX = event.clientX - this.previousTouch.x;
            const deltaY = event.clientY - this.previousTouch.y;
            
            this.rotateModel(deltaX, deltaY);
            
            this.previousTouch = {
                x: event.clientX,
                y: event.clientY
            };
        }
    },
    
    onMouseUp: function (event) {
        this.isDragging = false;
    },
    
    rotateModel: function (deltaX, deltaY) {
        const currentRotation = this.el.getAttribute('rotation');
        const sensitivity = 0.5;
        
        // Y軸（水平）とX軸（垂直）の回転
        const newRotation = {
            x: currentRotation.x - deltaY * sensitivity,
            y: currentRotation.y + deltaX * sensitivity,
            z: currentRotation.z
        };
        
        this.el.setAttribute('rotation', newRotation);
    },
    
    scaleModel: function (scaleRatio) {
        const currentScale = this.el.getAttribute('scale');
        const newScale = {
            x: Math.max(0.5, Math.min(10, currentScale.x * scaleRatio)),
            y: Math.max(0.5, Math.min(10, currentScale.y * scaleRatio)),
            z: Math.max(0.5, Math.min(10, currentScale.z * scaleRatio))
        };
        
        this.el.setAttribute('scale', newScale);
    },
    
    getPinchDistance: function (touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
});

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
    
    // カメラ権限要求
    async requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            throw new Error('カメラアクセスが許可されていません');
        }
    }
    
    // ARシーン設定
    setupARScene() {
        this.marker = document.querySelector('#hiromMarker');
        this.model = document.querySelector('#interactiveModel');
        
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
    }
    
    // マーカー消失時の処理
    onMarkerLost() {
        // 将来的なクリーンアップ処理などに使用
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
