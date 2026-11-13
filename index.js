export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // パスの先頭の "/" を削ったものをターゲットURL文字列とする
    // 例: "/https://discord.com/login" -> "https://discord.com/login"
    let targetUrlStr = url.pathname.slice(1);
    if (url.search) {
      targetUrlStr += url.search;
    }

    // ターゲットURLが http または https で始まっているか確認
    if (!targetUrlStr.startsWith("http://") && !targetUrlStr.startsWith("https://")) {
      return new Response(
        "【使い方】\nWorkerのURLの後ろに開きたいURLを続けて入力してください。\n例: " + url.origin + "/https://discord.com/",
        { status: 400, headers: { "content-type": "text/plain; charset=utf-8" } }
      );
    }

    try {
      const targetUrl = new URL(targetUrlStr);
      
      // リクエストヘッダーの構築（Discordなどのサーバーに正しいHostを伝える）
      const newHeaders = new Headers(request.headers);
      newHeaders.set("Host", targetUrl.host);
      newHeaders.set("Origin", targetUrl.origin);
      newHeaders.set("Referer", targetUrl.origin + "/");

      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: newHeaders,
        body: request.body,
        redirect: "manual"
      });

      let response = await fetch(modifiedRequest);

      // リダイレクト（302など）が発生した場合の処理
      // プロキシ経由のURL（/https://...）を維持するように書き換える
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("Location");
        if (location) {
          let newLocation = location;
          if (location.startsWith("http://") || location.startsWith("https://")) {
            newLocation = `${url.origin}/${location}`;
          } else if (location.startsWith("/")) {
            newLocation = `${url.origin}/${targetUrl.origin}${location}`;
          }
          
          const newRespHeaders = new Headers(response.headers);
          newRespHeaders.set("Location", newLocation);
          return new Response(response.body, {
            status: response.status,
            headers: newRespHeaders
          });
        }
      }

      // HTMLやJavaScript内のリンクを、このプロキシ経由のURLに書き換える
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html") || contentType.includes("application/javascript")) {
        let bodyText = await response.text();
        
        // ページ内のターゲットオリジンへのリンクをプロキシ形式に置換
        bodyText = bodyText.replaceAll(targetUrl.origin, `${url.origin}/${targetUrl.origin}`);

        return new Response(bodyText, {
          status: response.status,
          headers: response.headers
        });
      }

      // 画像やその他のデータはそのまま返す
      return new Response(response.body, response);
