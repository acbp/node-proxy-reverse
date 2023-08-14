const http = require('http');
const httpProxy = require('http-proxy');

// Configurar o proxy reverso
const proxy = httpProxy.createProxyServer({});

// Endereço IP que você deseja redirecionar
const targetIP = process.env.ip;
const targetPort = 3000; // A porta do servidor alvo

// Criar o servidor proxy
const proxyServer = http.createServer((req, res) => {
  // Redirecionar todo o tráfego para o servidor alvo
  proxy.web(req, res, { target: `http://${targetIP}:${targetPort}` });
});

// Lidar com erros do proxy
proxy.on('error', (err, req, res) => {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Ocorreu um erro no proxy reverso.');
});

// Iniciar o servidor proxy
const proxyPort = 8080; // A porta em que o proxy vai ouvir
proxyServer.listen(proxyPort, () => {
  console.log(`Servidor proxy reverso em execução na porta ${proxyPort}`);
});
