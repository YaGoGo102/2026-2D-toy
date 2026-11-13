export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 転送先のベースURL
    const targetBase = "https://sercrest.goku";
    
    // ワーカーへのアクセス（例: https://2026-2d-toy.goku-0102-gg.workers.dev/about ）の
    // パスとクエリをそのままターゲットURLに結合する
    const targetUrl = new URL(targetBase + url.pathname + url.search);
    
    // 元のリクエストのヘッダーやメソッドを引き継ぐ
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "follow"
    });

    try {
      // ターゲットサイトからデータを取得してそのまま返す
      const response = await fetch(modifiedRequest);
      
      // レスポンスヘッダーを複製して、必要に応じてCORS等を調整
      const newResponse = new Response(response.body, response);
      return newResponse;
    } catch (e) {
      return new Response("Error fetching target site: " + e.message, { status: 500 });
    }
  }
};
