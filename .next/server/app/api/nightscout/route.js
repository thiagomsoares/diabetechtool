"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/nightscout/route";
exports.ids = ["app/api/nightscout/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fnightscout%2Froute&page=%2Fapi%2Fnightscout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnightscout%2Froute.ts&appDir=%2FUsers%2Fthiagomsoares%2FProjetos%2FDiabetechFree%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fthiagomsoares%2FProjetos%2FDiabetechFree&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fnightscout%2Froute&page=%2Fapi%2Fnightscout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnightscout%2Froute.ts&appDir=%2FUsers%2Fthiagomsoares%2FProjetos%2FDiabetechFree%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fthiagomsoares%2FProjetos%2FDiabetechFree&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_thiagomsoares_Projetos_DiabetechFree_app_api_nightscout_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/nightscout/route.ts */ \"(rsc)/./app/api/nightscout/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/nightscout/route\",\n        pathname: \"/api/nightscout\",\n        filename: \"route\",\n        bundlePath: \"app/api/nightscout/route\"\n    },\n    resolvedPagePath: \"/Users/thiagomsoares/Projetos/DiabetechFree/app/api/nightscout/route.ts\",\n    nextConfigOutput,\n    userland: _Users_thiagomsoares_Projetos_DiabetechFree_app_api_nightscout_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/nightscout/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZuaWdodHNjb3V0JTJGcm91dGUmcGFnZT0lMkZhcGklMkZuaWdodHNjb3V0JTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGbmlnaHRzY291dCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnRoaWFnb21zb2FyZXMlMkZQcm9qZXRvcyUyRkRpYWJldGVjaEZyZWUlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGdGhpYWdvbXNvYXJlcyUyRlByb2pldG9zJTJGRGlhYmV0ZWNoRnJlZSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDdUI7QUFDcEc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uaWdodHNjb3V0LWRhc2hib2FyZC8/MmJjZiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvdGhpYWdvbXNvYXJlcy9Qcm9qZXRvcy9EaWFiZXRlY2hGcmVlL2FwcC9hcGkvbmlnaHRzY291dC9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvbmlnaHRzY291dC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL25pZ2h0c2NvdXRcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL25pZ2h0c2NvdXQvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvdGhpYWdvbXNvYXJlcy9Qcm9qZXRvcy9EaWFiZXRlY2hGcmVlL2FwcC9hcGkvbmlnaHRzY291dC9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvbmlnaHRzY291dC9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fnightscout%2Froute&page=%2Fapi%2Fnightscout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnightscout%2Froute.ts&appDir=%2FUsers%2Fthiagomsoares%2FProjetos%2FDiabetechFree%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fthiagomsoares%2FProjetos%2FDiabetechFree&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/nightscout/route.ts":
/*!*************************************!*\
  !*** ./app/api/nightscout/route.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\nasync function POST(req) {\n    try {\n        const body = await req.json();\n        let { url, apiSecret } = body;\n        // Limpar a URL removendo barras extras\n        url = url.replace(/([^:]\\/)\\/+/g, \"$1\");\n        const headers = {\n            \"Accept\": \"application/json\",\n            \"Content-Type\": \"application/json\",\n            \"API-SECRET\": apiSecret\n        };\n        console.log(\"Fazendo requisi\\xe7\\xe3o para:\", url);\n        console.log(\"Headers:\", {\n            ...headers,\n            \"API-SECRET\": \"****\"\n        });\n        const response = await fetch(url, {\n            method: \"GET\",\n            headers,\n            cache: \"no-store\"\n        });\n        if (!response.ok) {\n            console.error(\"Erro na resposta:\", {\n                status: response.status,\n                statusText: response.statusText,\n                url: url\n            });\n            if (response.status === 401) {\n                const errorBody = await response.text();\n                console.error(\"Corpo do erro 401:\", errorBody);\n                return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                    error: \"Erro de autentica\\xe7\\xe3o: Verifique sua chave API\",\n                    details: errorBody\n                }, {\n                    status: 401\n                });\n            }\n            if (response.status === 404) {\n                return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                    error: \"URL n\\xe3o encontrada. Verifique se a URL do Nightscout est\\xe1 correta.\",\n                    details: `Não foi possível acessar: ${url}`\n                }, {\n                    status: 404\n                });\n            }\n            throw new Error(`HTTP error! status: ${response.status}`);\n        }\n        const data = await response.json();\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data);\n    } catch (error) {\n        console.error(\"Erro detalhado:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: error instanceof Error ? error.message : \"Erro ao buscar dados do Nightscout\",\n            details: error\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL25pZ2h0c2NvdXQvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBd0Q7QUFFakQsZUFBZUMsS0FBS0MsR0FBZ0I7SUFDekMsSUFBSTtRQUNGLE1BQU1DLE9BQU8sTUFBTUQsSUFBSUUsSUFBSTtRQUMzQixJQUFJLEVBQUVDLEdBQUcsRUFBRUMsU0FBUyxFQUFFLEdBQUdIO1FBRXpCLHVDQUF1QztRQUN2Q0UsTUFBTUEsSUFBSUUsT0FBTyxDQUFDLGdCQUFnQjtRQUVsQyxNQUFNQyxVQUF1QjtZQUMzQixVQUFVO1lBQ1YsZ0JBQWdCO1lBQ2hCLGNBQWNGO1FBQ2hCO1FBRUFHLFFBQVFDLEdBQUcsQ0FBQyxrQ0FBNEJMO1FBQ3hDSSxRQUFRQyxHQUFHLENBQUMsWUFBWTtZQUN0QixHQUFHRixPQUFPO1lBQ1YsY0FBYztRQUNoQjtRQUVBLE1BQU1HLFdBQVcsTUFBTUMsTUFBTVAsS0FBSztZQUNoQ1EsUUFBUTtZQUNSTDtZQUNBTSxPQUFPO1FBQ1Q7UUFFQSxJQUFJLENBQUNILFNBQVNJLEVBQUUsRUFBRTtZQUNoQk4sUUFBUU8sS0FBSyxDQUFDLHFCQUFxQjtnQkFDakNDLFFBQVFOLFNBQVNNLE1BQU07Z0JBQ3ZCQyxZQUFZUCxTQUFTTyxVQUFVO2dCQUMvQmIsS0FBS0E7WUFDUDtZQUVBLElBQUlNLFNBQVNNLE1BQU0sS0FBSyxLQUFLO2dCQUMzQixNQUFNRSxZQUFZLE1BQU1SLFNBQVNTLElBQUk7Z0JBQ3JDWCxRQUFRTyxLQUFLLENBQUMsc0JBQXNCRztnQkFFcEMsT0FBT25CLHFEQUFZQSxDQUFDSSxJQUFJLENBQ3RCO29CQUNFWSxPQUFPO29CQUNQSyxTQUFTRjtnQkFDWCxHQUNBO29CQUFFRixRQUFRO2dCQUFJO1lBRWxCO1lBRUEsSUFBSU4sU0FBU00sTUFBTSxLQUFLLEtBQUs7Z0JBQzNCLE9BQU9qQixxREFBWUEsQ0FBQ0ksSUFBSSxDQUN0QjtvQkFDRVksT0FBTztvQkFDUEssU0FBUyxDQUFDLDBCQUEwQixFQUFFaEIsSUFBSSxDQUFDO2dCQUM3QyxHQUNBO29CQUFFWSxRQUFRO2dCQUFJO1lBRWxCO1lBRUEsTUFBTSxJQUFJSyxNQUFNLENBQUMsb0JBQW9CLEVBQUVYLFNBQVNNLE1BQU0sQ0FBQyxDQUFDO1FBQzFEO1FBRUEsTUFBTU0sT0FBTyxNQUFNWixTQUFTUCxJQUFJO1FBQ2hDLE9BQU9KLHFEQUFZQSxDQUFDSSxJQUFJLENBQUNtQjtJQUMzQixFQUFFLE9BQU9QLE9BQU87UUFDZFAsUUFBUU8sS0FBSyxDQUFDLG1CQUFtQkE7UUFDakMsT0FBT2hCLHFEQUFZQSxDQUFDSSxJQUFJLENBQ3RCO1lBQ0VZLE9BQU9BLGlCQUFpQk0sUUFBUU4sTUFBTVEsT0FBTyxHQUFHO1lBQ2hESCxTQUFTTDtRQUNYLEdBQ0E7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uaWdodHNjb3V0LWRhc2hib2FyZC8uL2FwcC9hcGkvbmlnaHRzY291dC9yb3V0ZS50cz9mMDlmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcTogTmV4dFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxLmpzb24oKTtcbiAgICBsZXQgeyB1cmwsIGFwaVNlY3JldCB9ID0gYm9keTtcblxuICAgIC8vIExpbXBhciBhIFVSTCByZW1vdmVuZG8gYmFycmFzIGV4dHJhc1xuICAgIHVybCA9IHVybC5yZXBsYWNlKC8oW146XVxcLylcXC8rL2csIFwiJDFcIik7XG5cbiAgICBjb25zdCBoZWFkZXJzOiBIZWFkZXJzSW5pdCA9IHtcbiAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgJ0FQSS1TRUNSRVQnOiBhcGlTZWNyZXRcbiAgICB9O1xuXG4gICAgY29uc29sZS5sb2coJ0ZhemVuZG8gcmVxdWlzacOnw6NvIHBhcmE6JywgdXJsKTtcbiAgICBjb25zb2xlLmxvZygnSGVhZGVyczonLCB7XG4gICAgICAuLi5oZWFkZXJzLFxuICAgICAgJ0FQSS1TRUNSRVQnOiAnKioqKidcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGNhY2hlOiAnbm8tc3RvcmUnXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvIG5hIHJlc3Bvc3RhOicsIHtcbiAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlc3BvbnNlLnN0YXR1c1RleHQsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIGNvbnN0IGVycm9yQm9keSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignQ29ycG8gZG8gZXJybyA0MDE6JywgZXJyb3JCb2R5KTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgICB7IFxuICAgICAgICAgICAgZXJyb3I6ICdFcnJvIGRlIGF1dGVudGljYcOnw6NvOiBWZXJpZmlxdWUgc3VhIGNoYXZlIEFQSScsXG4gICAgICAgICAgICBkZXRhaWxzOiBlcnJvckJvZHlcbiAgICAgICAgICB9LFxuICAgICAgICAgIHsgc3RhdHVzOiA0MDEgfVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICAgIHsgXG4gICAgICAgICAgICBlcnJvcjogJ1VSTCBuw6NvIGVuY29udHJhZGEuIFZlcmlmaXF1ZSBzZSBhIFVSTCBkbyBOaWdodHNjb3V0IGVzdMOhIGNvcnJldGEuJyxcbiAgICAgICAgICAgIGRldGFpbHM6IGBOw6NvIGZvaSBwb3Nzw612ZWwgYWNlc3NhcjogJHt1cmx9YFxuICAgICAgICAgIH0sXG4gICAgICAgICAgeyBzdGF0dXM6IDQwNCB9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvciEgc3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihkYXRhKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvIGRldGFsaGFkbzonLCBlcnJvcik7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBcbiAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ0Vycm8gYW8gYnVzY2FyIGRhZG9zIGRvIE5pZ2h0c2NvdXQnLFxuICAgICAgICBkZXRhaWxzOiBlcnJvclxuICAgICAgfSxcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgICk7XG4gIH1cbn0gIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsIlBPU1QiLCJyZXEiLCJib2R5IiwianNvbiIsInVybCIsImFwaVNlY3JldCIsInJlcGxhY2UiLCJoZWFkZXJzIiwiY29uc29sZSIsImxvZyIsInJlc3BvbnNlIiwiZmV0Y2giLCJtZXRob2QiLCJjYWNoZSIsIm9rIiwiZXJyb3IiLCJzdGF0dXMiLCJzdGF0dXNUZXh0IiwiZXJyb3JCb2R5IiwidGV4dCIsImRldGFpbHMiLCJFcnJvciIsImRhdGEiLCJtZXNzYWdlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/nightscout/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fnightscout%2Froute&page=%2Fapi%2Fnightscout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnightscout%2Froute.ts&appDir=%2FUsers%2Fthiagomsoares%2FProjetos%2FDiabetechFree%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fthiagomsoares%2FProjetos%2FDiabetechFree&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();