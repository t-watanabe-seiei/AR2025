// A-Frameカスタムコンポーネント: タッチ操作（デプロイ対応版）
AFRAME.registerComponent('touch-controls', {
    init: function () {
        this.isDragging = false;
        this.previousTouch = { x: 0, y: 0 };
        this.pinchDistance = 0;
        this.initialScale = this.el.getAttribute('scale');
        this.isMarkerVisible = false;
        
        // デバウンスのための変数
        this.lastInteractionTime = 0;
        this.interactionThrottle = 16; // 60fps制限
        
        // マーカーの状態を監視
        const marker = this.el.parentEl;
        if (marker) {
            marker.addEventListener('markerFound', () => {
                this.isMarkerVisible = true;
                this.setupEventListeners();
            });
            
            marker.addEventListener('markerLost', () => {
                this.isMarkerVisible = false;
                this.removeEventListeners();
            });
        }
    },
    
    setupEventListeners: function() {
        // 既存のリスナーを削除
        this.removeEventListeners();
        
        // パッシブイベントリスナーで最適化
        const canvas = this.el.sceneEl.canvas;
        if (canvas) {
            // タッチイベント
            canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
            canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
            canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
            
            // マウスイベント
            canvas.addEventListener('mousedown', this.onMouseDown.bind(this), { passive: false });
            canvas.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: false });
            canvas.addEventListener('mouseup', this.onMouseUp.bind(this), { passive: false });
            canvas.addEventListener('mouseleave', this.onMouseUp.bind(this), { passive: false });
        }
    },
    
    removeEventListeners: function() {
        const canvas = this.el.sceneEl.canvas;
        if (canvas) {
            canvas.removeEventListener('touchstart', this.onTouchStart);
            canvas.removeEventListener('touchmove', this.onTouchMove);
            canvas.removeEventListener('touchend', this.onTouchEnd);
            canvas.removeEventListener('mousedown', this.onMouseDown);
            canvas.removeEventListener('mousemove', this.onMouseMove);
            canvas.removeEventListener('mouseup', this.onMouseUp);
            canvas.removeEventListener('mouseleave', this.onMouseUp);
        }
    },
    
    onTouchStart: function (event) {
        if (!this.isMarkerVisible) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.previousTouch = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        } else if (event.touches.length === 2) {
            this.isDragging = false;
            this.pinchDistance = this.getPinchDistance(event.touches);
        }
    },
    
    onTouchMove: function (event) {
        if (!this.isMarkerVisible) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const now = Date.now();
        if (now - this.lastInteractionTime < this.interactionThrottle) return;
        this.lastInteractionTime = now;
        
        if (event.touches.length === 1 && this.isDragging) {
            const deltaX = event.touches[0].clientX - this.previousTouch.x;
            const deltaY = event.touches[0].clientY - this.previousTouch.y;
            
            this.rotateModel(deltaX, deltaY);
            
            this.previousTouch = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        } else if (event.touches.length === 2) {
            const currentPinchDistance = this.getPinchDistance(event.touches);
            if (this.pinchDistance > 0) {
                const scaleRatio = currentPinchDistance / this.pinchDistance;
                this.scaleModel(scaleRatio);
            }
            this.pinchDistance = currentPinchDistance;
        }
    },
    
    onTouchEnd: function (event) {
        if (!this.isMarkerVisible) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        this.isDragging = false;
        this.pinchDistance = 0;
    },
    
    onMouseDown: function (event) {
        if (!this.isMarkerVisible) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        this.isDragging = true;
        this.previousTouch = {
            x: event.clientX,
            y: event.clientY
        };
    },
    
    onMouseMove: function (event) {
        if (!this.isMarkerVisible || !this.isDragging) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const now = Date.now();
        if (now - this.lastInteractionTime < this.interactionThrottle) return;
        this.lastInteractionTime = now;
        
        const deltaX = event.clientX - this.previousTouch.x;
        const deltaY = event.clientY - this.previousTouch.y;
        
        this.rotateModel(deltaX, deltaY);
        
        this.previousTouch = {
            x: event.clientX,
            y: event.clientY
        };
    },
    
    onMouseUp: function (event) {
        if (!this.isMarkerVisible) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        this.isDragging = false;
    },
    
    rotateModel: function (deltaX, deltaY) {
        if (!this.el || !this.isMarkerVisible) return;
        
        const currentRotation = this.el.getAttribute('rotation');
        const sensitivity = 0.3; // デプロイ環境では感度を下げる
        
        const newRotation = {
            x: Math.max(-90, Math.min(90, currentRotation.x - deltaY * sensitivity)),
            y: currentRotation.y + deltaX * sensitivity,
            z: currentRotation.z
        };
        
        // アニメーションでスムーズに変更
        this.el.setAttribute('animation__rotation', {
            property: 'rotation',
            to: `${newRotation.x} ${newRotation.y} ${newRotation.z}`,
            dur: 50,
            easing: 'linear'
        });
    },
    
    scaleModel: function (scaleRatio) {
        if (!this.el || !this.isMarkerVisible) return;
        
        const currentScale = this.el.getAttribute('scale');
        const clampedRatio = Math.max(0.9, Math.min(1.1, scaleRatio)); // 変化量を制限
        
        const newScale = {
            x: Math.max(0.5, Math.min(8, currentScale.x * clampedRatio)),
            y: Math.max(0.5, Math.min(8, currentScale.y * clampedRatio)),
            z: Math.max(0.5, Math.min(8, currentScale.z * clampedRatio))
        };
        
        // アニメーションでスムーズに変更
        this.el.setAttribute('animation__scale', {
            property: 'scale',
            to: `${newScale.x} ${newScale.y} ${newScale.z}`,
            dur: 50,
            easing: 'linear'
        });
    },
    
    getPinchDistance: function (touches) {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    remove: function() {
        this.removeEventListeners();
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
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
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
                    if (this.model) {
                        // 向き変更後にモデルをリセット
                        this.model.setAttribute('position', '0 0 0');
                    }
                }, 500);
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
