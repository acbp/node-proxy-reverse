const http = require('http');
const httpProxy = require('http-proxy');

// Endereço IP que você deseja redirecionar
const targetIP = process.env.ip || '0.0.0.0';
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
	console.info(req, `\n${req.method}:${req.url}`);
	if (req.url.match(/\/$|health/i)?.[0]) {
		res.writeHead(204, { 'Content-Type': 'text/plain' });
		console.log('OK')
		return res.end('OK');
	}
	const key = req.url.split("?").shift();
	if (routes.has(key)) {
		console.log('key', key);
		return routes.get(key)(req, res);
	}
	const queryIP = new URL("http://domain" + req.url).searchParams.get('ip')
	let url = `http://${targetIP}:${targetPort}`
	// Redirecionar todo o tráfego para o servidor alvo
	if (queryIP) {
		url = `http://${queryIP}/`;
		console.log('proxy', url)
		return proxy.web(req, res, { target: `${url}` })
	}

	return proxy.web(req, res)
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
});

const routes = new Map();
const add = (e, v) => routes.set(e, v)
add("/webhook/facebook-realtime", (req, res) => {

	const url = new URL("http://home" + req.url)
	// Parse the query params
	let mode = url.searchParams.get("hub.mode")
	let token = url.searchParams.get("hub.verify_token");
	let challenge = url.searchParams.get("hub.challenge")

	let code = 404;
	// Check if a token and mode is in the query string of the request
	if (mode && token) {
		// Check the mode and token sent is correct
		if (mode === "subscribe" && token === "token") {
			// Respond with the challenge token from the request
			code = 200;
			msg = (challenge);
		} else {
			// Respond with '403 Forbidden' if verify tokens do not match
			code = (403);
			msg = "Forbidden"
		}
	}
	res.writeHead(code, { 'Content-Type': 'text/plain' });
	res.end(msg);
})
