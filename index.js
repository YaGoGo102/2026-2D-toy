export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // パスの先頭のスラッシュを取り除いてターゲットURLを取得
    // 例: "/https://discord.com/" -> "https://discord.com/"
    const targetUrlStr = url.pathname.slice(1) + url.search;

    if (!targetUrlStr.startsWith("http")) {
      return new Response("使い方: https://自分のWorkerのURL/https://discord.com/", { status: 400 });
    }

    // ターゲットURLにリクエストを中継して中身をそのまま返す
    const targetUrl = new URL(targetUrlStr);
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "follow"
    });

    return fetch(modifiedRequest);
  }
};
