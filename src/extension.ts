import * as vscode from "vscode";

const tsLitPluginId = "ts-lit-plugin";
const typeScriptExtensionId = "vscode.typescript-language-features";
const configurationSection = "lit-plugin";

interface Config {
	disable: boolean;
	verbose: boolean;
	format: { disable: boolean };
	htmlTemplateTags: string[];
	externalHtmlTagNames: string[];
	skipMissingImports: boolean;
	skipUnknownHtmlTags: boolean;
	skipUnknownHtmlAttributes: boolean;
	skipTypeChecking: boolean;
}

export async function activate(context: vscode.ExtensionContext) {
	const extension = vscode.extensions.getExtension(typeScriptExtensionId);
	if (!extension) {
		return;
	}

	await extension.activate();
	if (!extension.exports || !extension.exports.getAPI) {
		return;
	}

	const api = extension.exports.getAPI(0);
	if (!api) {
		return;
	}

	vscode.workspace.onDidChangeConfiguration(
		e => {
			if (e.affectsConfiguration(configurationSection)) {
				synchronizeConfig(api);
			}
		},
		undefined,
		context.subscriptions
	);

	synchronizeConfig(api);
}

function synchronizeConfig(api: any) {
	api.configurePlugin(tsLitPluginId, getConfig());
}

function getConfig(): Partial<Config> {
	const config = vscode.workspace.getConfiguration(configurationSection);
	const outConfig: Partial<Config> = {};

	withConfigValue(config, "disable", value => {
		outConfig.disable = value;
	});
	withConfigValue(config, "verbose", value => {
		outConfig.verbose = value;
	});
	withConfigValue(config, "format.disable", value => {
		outConfig.format = Object.assign(outConfig.format || {}, { disable: value });
	});
	withConfigValue(config, "htmlTemplateTags", value => {
		outConfig.htmlTemplateTags = value;
	});
	withConfigValue(config, "externalHtmlTagNames", value => {
		outConfig.externalHtmlTagNames = value;
	});
	withConfigValue(config, "skipMissingImports", value => {
		outConfig.skipMissingImports = value;
	});
	withConfigValue(config, "skipUnknownHtmlTags", value => {
		outConfig.skipUnknownHtmlTags = value;
	});
	withConfigValue(config, "skipUnknownHtmlAttributes", value => {
		outConfig.skipUnknownHtmlAttributes = value;
	});
	withConfigValue(config, "skipTypeChecking", value => {
		outConfig.skipTypeChecking = value;
	});

	return outConfig;
}

function withConfigValue(config: vscode.WorkspaceConfiguration, key: string, withValue: (value: any) => void): void {
	const configSetting = config.inspect(key);
	if (!configSetting) {
		return;
	}

	// Make sure the user has actually set the value.
	// VS Code will return the default values instead of `undefined`, even if user has not don't set anything.
	if (typeof configSetting.globalValue === "undefined" && typeof configSetting.workspaceFolderValue === "undefined" && typeof configSetting.workspaceValue === "undefined") {
		return;
	}

	const value = config.get(key, undefined);

	if (typeof value !== "undefined") {
		withValue(value);
	}
}
