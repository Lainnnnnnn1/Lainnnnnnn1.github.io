/**
 * Cloudflare Worker - 密码保护 GitHub Pages 博客
 *
 * 功能：在 GitHub Pages 前面加一层 HTTP Basic Authentication
 * 访问网站时需要输入用户名和密码才能查看内容
 */

export interface Env {
	AUTH_USER: string;
	AUTH_PASS: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// 如果是直接访问 Worker 的 favicon，跳过
		if (url.pathname === '/favicon.ico') {
			return new Response(null, { status: 204 });
		}

		// 检查是否已认证
		const authHeader = request.headers.get('Authorization');
		if (!authHeader || !authHeader.startsWith('Basic ')) {
			return new Response('Please login to access this site', {
				status: 401,
				headers: {
					'WWW-Authenticate': 'Basic realm="Private Notes Blog"',
					'Content-Type': 'text/plain; charset=utf-8',
				},
			});
		}

		// 解码 Base64 认证信息
		const base64 = authHeader.slice(6);
		const decoded = atob(base64);
		const [username, password] = decoded.split(':');

		// 验证用户名和密码
		if (username !== env.AUTH_USER || password !== env.AUTH_PASS) {
			return new Response('Invalid username or password', {
				status: 401,
				headers: {
					'WWW-Authenticate': 'Basic realm="Private Notes Blog"',
					'Content-Type': 'text/plain; charset=utf-8',
				},
			});
		}

		// 认证通过，代理请求到 GitHub Pages
		const githubUrl = `https://lainnnnnnn1.github.io${url.pathname}${url.search}`;
		const response = await fetch(githubUrl, {
			method: request.method,
			headers: request.headers,
		});

		// 克隆响应并替换内容中的默认域名
		let body = await response.text();
		body = body.replace(/https:\/\/quartz\.jzhao\.xyz/g, url.origin);

		// 返回替换后的响应
		return new Response(body, {
			status: response.status,
			headers: response.headers,
		});
	},
};
