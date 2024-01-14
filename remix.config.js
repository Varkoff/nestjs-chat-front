/** @type {import('@remix-run/dev').AppConfig} */
export default {
	ignoredRouteFiles: ['**/.*'],
	tailwind: true,
	browserNodeBuiltinsPolyfill: {
		modules: {
			crypto: true,
		},
	},
	serverModuleFormat: 'esm',
	serverPlatform: 'node',
	watchPaths: ['./tailwind.config.ts'],
	cacheDirectory: './node_modules/.cache/remix',
	// appDirectory: "app",
	// assetsBuildDirectory: "public/build",
	// publicPath: "/build/",
	// serverBuildPath: "build/index.js",
};
