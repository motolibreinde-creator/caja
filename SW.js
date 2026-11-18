/* Modo sin conexión para Moda Americana para Ti.
   Guarda la página en el iPad para que abra aunque no haya internet.
   Si algún día se actualiza la página, sube el número de versión. */
var CACHE='mapt-v2';
var SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    }).then(function(){return self.clients.claim();})
  );
});

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET') return;
  var url=new URL(req.url);
  var mismo=url.origin===location.origin;
  var fuentes=url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';
  if(!mismo&&!fuentes) return;

  /* Primero lo guardado (abre al instante, aun con internet lento o sin él)
     y en segundo plano se actualiza para la próxima vez. */
  e.respondWith(
    caches.match(req).then(function(guardado){
      var red=fetch(req).then(function(res){
        if(res&&(res.ok||res.type==='opaque')){
          var copia=res.clone();
          caches.open(CACHE).then(function(c){c.put(req,copia);});
        }
        return res;
      }).catch(function(){
        return guardado||caches.match('index.html');
      });
      return guardado||red;
    })
  );
});