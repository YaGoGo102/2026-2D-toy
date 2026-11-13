export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // アクセスされたパスやクエリを、目的のURLの先頭にくっつけてリダイレクトする
    const targetUrl = "https://takumei.goku-0102-gg.workers.dev" + url.pathname + url.search;
    
    return Response.redirect(targetUrl, 302);
  }
};
