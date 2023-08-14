const http = require('http');
const httpProxy = require('http-proxy');

// Endereço IP que você deseja redirecionar
const targetIP = process.env.ip || '192.168.0.45';
const targetPort = process.env.targetPORT || 3000; // A porta do servidor alvo
// Configurar o proxy reverso
const proxy = httpProxy.createProxyServer({
	target: {
		host: targetIP,
		port: targetPort,
	}
});

// Criar o servidor proxy
const proxyServer = http.createServer((req, res) => {
	if (req.url.match(/\/$|health/i)?.[0] && req.method === "GET") {
		res.writeHead(204, { 'Content-Type': 'text/plain' });
		return res.end('OK');
	}
	// Redirecionar todo o tráfego para o servidor alvo
	proxy.web(req, res)

});

// Lidar com erros do proxy
proxy.on('error', (err, req, res) => {
	res.writeHead(500, { 'Content-Type': 'text/plain' });
	res.end('Ocorreu um erro no proxy reverso.');
});

// Iniciar o servidor proxy
const proxyPort = process.env.PORT || 8080; // A porta em que o proxy vai ouvir
proxyServer.listen(proxyPort, () => {
	console.log(`Servidor proxy reverso em execução na porta ${proxyPort}`);
	console.log('Envs', process.env)
});

proxyServer.on
