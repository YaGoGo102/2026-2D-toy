export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // ターゲットを Discord に設定
    const targetOrigin = "https://discord.com";
    
    // パスとクエリをそのままDiscordに向ける
    const targetUrl = new URL(targetOrigin + url.pathname + url.search);
    
    // リクエストヘッダーの Host を discord.com に書き換える
    const newHeaders = new Headers(request.headers);
    newHeaders.set("Host", "discord.com");
    // オリジンの偽装
    newHeaders.set("Origin", "https://discord.com");
    newHeaders.set("Referer", "https://discord.com/");

    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: "manual" // リダイレクトループを防ぐため
    });

    try {
      let response = await fetch(modifiedRequest);
      
      // リダイレクト（302など）が返ってきた場合、Discordのドメインを自分のWorkerのドメインに書き換える
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("Location");
        if (location) {
          let newLocation = location;
          if (location.startsWith("https://discord.com")) {
            newLocation = location.replace("https://discord.com", url.origin);
          } else if (location.startsWith("/")) {
            newLocation = url.origin + location;
          }
          const newRespHeaders = new Headers(response.headers);
          newRespHeaders.set("Location", newLocation);
          return new Response(response.body, {
            status: response.status,
            headers: newRespHeaders
          });
        }
      }

      // HTMLやJSなどのテキストデータの場合、中に含まれる "discord.com" を自分のWorkerのURLに置換する
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html") || contentType.includes("application/javascript")) {
        let bodyText = await response.text();
        
        // discord.com を自分のWorkerのオリジンに置換
        bodyText = bodyText.replaceAll("https://discord.com", url.origin);
        bodyText = bodyText.replaceAll("discord.com", url.host);

        return new Response(bodyText, {
          status: response.status,
          headers: response.headers
        });
      }

      // 画像やその他のデータはそのまま返す
      return new Response(response.body, response);

    } catch (e) {
      return new Response("Proxy Error: " + e.message, { status: 500 });
    }
  }
};
