/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import * as vscode from "vscode";
import { HttpHandler, HttpResponse, http } from "msw";
import { setupServer, SetupServerApi } from "msw/node";

const handlers: HttpHandler[] = [
  http.get("https://example.com/test", () => {
    return HttpResponse.json({ message: "Hello, world!" });
  }),
];

let server: SetupServerApi;
export let debugChannel: vscode.OutputChannel;

export function setupMockServer() {
  debugChannel = vscode.window.createOutputChannel("MSW Debug Channel");

  debugChannel.appendLine("Setting up mock server...");

  server = setupServer(...handlers);

  server.events.on("request:start", ({ request, requestId }) => {
    debugChannel.appendLine(
      `Outgoing request: ${request.method}, ${request.url}`
    );
  });

  server.events.on("request:unhandled", ({ request }) => {
    debugChannel.appendLine(
      `Intercepted a request without a matching request handler: ${request.method} ${request.url}`
    );
  });

  server.events.on("response:mocked", ({ request, response }) => {
    debugChannel.appendLine(
      `Outgoing request "${request.method} ${request.url}" received mock response: ${response.status} ${response.statusText}`
    );
  });

  server.events.on("unhandledException", ({ request, error }) => {
    debugChannel.appendLine(
      `${request.method} ${request.url} errored! See details below.`
    );
  });

  server.listen();
}

export function stopMockServer() {
  server.close();
}
