# ARアプリケーション詳細設計書

## システム設計概要

### アーキテクチャ
```
ユーザー（ブラウザ）
    ↓
HTML + CSS + JavaScript
    ↓
A-Frame（WebVRフレームワーク）
    ↓
AR.js（ARライブラリ）
    ↓
Three.js（3Dレンダリング）
    ↓
WebGL + getUserMedia（カメラアクセス）
```

### 技術スタック詳細
- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **3Dフレームワーク**: A-Frame 1.4.0以上
- **ARライブラリ**: AR.js 3.4.0以上
- **レンダリング**: Three.js（A-Frameに内包）
- **カメラAPI**: WebRTC getUserMedia API

## プロジェクト構造設計

```
AR2025/
├── index.html               # メインARアプリケーション
├── style.css               # スタイルシート
├── script.js               # カスタムJavaScript
├── assets/
│   ├── models/             # 3Dモデル格納
│   │   └── duck.gltf       # サンプル3Dモデル（軽量）
│   ├── markers/            # ARマーカー格納
│   │   ├── hiro.png        # HIROマーカー画像
│   │   └── hiro-marker.pdf # 印刷用マーカー
│   └── textures/           # テクスチャファイル
├── .claude_workflow/       # 開発管理ファイル
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
└── README.md              # プロジェクト説明書
```

## コア機能の詳細設計

### 1. HTMLマークアップ設計

#### メインHTML構造
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AR体験アプリ</title>
    
    <!-- A-Frame + AR.js CDN -->
    <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.0/aframe/build/aframe-ar.js"></script>
    
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- ローディング画面 -->
    <div id="loadingScreen">
        <div class="loading-content">
            <h2>AR体験の準備中...</h2>
            <div class="spinner"></div>
        </div>
    </div>
    
    <!-- エラーメッセージ -->
    <div id="errorScreen" class="hidden">
        <div class="error-content">
            <h2>エラーが発生しました</h2>
            <p id="errorMessage"></p>
            <button onclick="retryCamera()">再試行</button>
        </div>
    </div>
    
    <!-- 使用方法案内 -->
    <div id="instructionOverlay" class="hidden">
        <div class="instruction-content">
            <h3>使用方法</h3>
            <p>HIROマーカーをカメラに向けてください</p>
            <button onclick="hideInstructions()">開始</button>
        </div>
    </div>
    
    <!-- メインARシーン -->
    <a-scene
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
        vr-mode-ui="enabled: false"
        renderer="logarithmicDepthBuffer: true;"
        loading-screen="enabled: false">
        
        <!-- アセット管理 -->
        <a-assets>
            <a-asset-item id="duckModel" src="assets/models/duck.gltf"></a-asset-item>
        </a-assets>
        
        <!-- HIROマーカー -->
        <a-marker preset="hiro" id="hiromMarker">
            <!-- 3Dモデル配置 -->
            <a-gltf-model 
                src="#duckModel"
                position="0 0 0"
                scale="0.5 0.5 0.5"
                rotation="0 0 0"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 3000">
            </a-gltf-model>
        </a-marker>
        
        <!-- カメラ設定 -->
        <a-entity camera></a-entity>
    </a-scene>
    
    <script src="script.js"></script>
</body>
</html>
```

### 2. CSS スタイル設計

#### レスポンシブ＆UI設計
```css
/* 基本設定 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    overflow: hidden;
}

/* A-Frame シーン全画面表示 */
a-scene {
    width: 100vw;
    height: 100vh;
}

/* ローディング画面 */
#loadingScreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-content {
    text-align: center;
    color: white;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 20px auto;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* エラー画面 */
#errorScreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}

.error-content {
    background: white;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 案内オーバーレイ */
#instructionOverlay {
    position: fixed;
    top: 20px;
    left: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 10px;
    z-index: 500;
}

/* ユーティリティクラス */
.hidden {
    display: none !important;
}

/* モバイル対応 */
@media (max-width: 768px) {
    .loading-content h2,
    .error-content h2 {
        font-size: 1.5rem;
    }
    
    .instruction-content {
        font-size: 0.9rem;
    }
}
```

### 3. JavaScript 機能設計

#### アプリケーション制御
```javascript
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
```

## パフォーマンス最適化設計

### 1. 3Dモデル最適化
- **ポリゴン数**: 10,000ポリゴン以下
- **テクスチャサイズ**: 1024x1024px以下
- **フォーマット**: GLTF 2.0（圧縮）
- **ファイルサイズ**: 2MB以下

### 2. レンダリング最適化
- **フレームレート制限**: 30fps目標
- **LOD（Level of Detail）**: 距離に応じた品質調整
- **フラストラムカリング**: 不可視オブジェクトの描画スキップ

### 3. メモリ管理
- **テクスチャキャッシュ**: 使用済みテクスチャの再利用
- **ジオメトリプール**: オブジェクトの再利用
- **ガベージコレクション**: 定期的なクリーンアップ

## セキュリティ・プライバシー設計

### 1. データプライバシー
- カメラ映像はローカル処理のみ
- 外部サーバーへの送信なし
- ユーザー同意の明確な表示

### 2. HTTPS要件
- 本番環境では必須
- 開発環境ではlocalhostで動作
- 証明書の適切な設定

### 3. エラーハンドリング
- 機密情報の漏洩防止
- 適切なエラーメッセージ表示
- フォールバック機能の提供

## ブラウザ互換性設計

### サポート対象
- **Chrome**: 80+ (推奨)
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### フォールバック機能
- WebGL非対応時の警告
- カメラアクセス失敗時の案内
- 古いブラウザでの動作制限説明

## デプロイメント設計

### 1. 静的ホスティング
- GitHub Pages対応
- Netlify/Vercel対応
- CDNによる高速配信

### 2. HTTPSセットアップ
- Let's Encrypt証明書
- 自動更新設定
- リダイレクト設定

### 3. 監視・分析
- パフォーマンス監視
- エラートラッキング
- ユーザビリティ分析
