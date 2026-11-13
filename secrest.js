const WORKER_URL = "https://takumei.goku-0102-gg.workers.dev/";

/**
 * パスやURLの先頭にWorkerのURLを結合する
 * @param {string} path - 結合したいパスやURL (例: "/api/user" または "api/user")
 * @returns {string} 結合された完全なURL
 */
function appendWorkerUrl(path) {
  // 先頭の余分なスラッシュを調整してキレイに結合する
  const cleanBase = WORKER_URL.endsWith('/') ? WORKER_URL.slice(0, -1) : WORKER_URL;
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  
  return cleanBase + cleanPath;
}

// 実行例
console.log(appendWorkerUrl("/api/data")); 
// 出力: https://takumei.goku-0102-gg.workers.dev/api/data

console.log(appendWorkerUrl("images/logo.png")); 
// 出力: https://takumei.goku-0102-gg.workers.dev/images/logo.png
