const http = require('http');
const httpProxy = require('http-proxy');

// Endereço IP que você deseja redirecionar
const targetIP = process.env.ip || '192.168.0.45'
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
	console.info(`\n${Date.now()}${req.method}:${req.url}`);

	const key = req.url.split("?").shift();
	console.info('key', key);
	if (routes.has(key)) {
		return routes.get(key)(req, res);
	}

	const queryIP = new URL("http://sub.domain.com" + req.url).searchParams.get('ip')
	let url = `http://${targetIP}:${targetPort}`

	console.log('proxy', url)
	// Redirecionar todo o tráfego para o servidor alvo
	if (queryIP) {
		url = `http://${queryIP}/`;
	}

	return proxy.web(req, res, { target: `${url}` })
});

// Lidar com erros do proxy
proxy.on('error', (err, req, res) => {
	res.writeHead(500, { 'Content-Type': 'text/plain' });
	res.end('Ocorreu um erro no proxy reverso.\n' + req.url);
});

// Iniciar o servidor proxy
const proxyPort = process.env.PORT || 8080; // A porta em que o proxy vai ouvir
proxyServer.listen(proxyPort, () => {
	console.log(`Servidor proxy reverso em execução na porta ${proxyPort}`);
});

const routes = new Map();
const add = (e, v) => routes.set(e, v)
add("/health", (req, res) => {
	let code = 204;
	let msg = "OK"
	console.log('OK')
	res.writeHead(code, { 'Content-Type': 'text/plain' });
	res.end(msg);
})
add("/", routes.get("/health"))
