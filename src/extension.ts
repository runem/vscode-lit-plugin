import * as vscode from 'vscode';

const taggedHtmlPluginId = 'ts-html-plugin';
const typeScriptExtensionId = 'vscode.typescript-language-features';
const configurationSection = 'tagged-html';

interface IConfig {
    verbose: boolean;
    flavor: string;
    tags: string[];
    externalTagNames: string[];
    ignoreImports: boolean;
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

    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(configurationSection)) {
            synchronizeConfig(api);
        }
    }, undefined, context.subscriptions);

    synchronizeConfig(api);
}

function synchronizeConfig(api: any) {
    api.configurePlugin(taggedHtmlPluginId, getConfig());
}


function getConfig(): Partial<IConfig> {
    const config = vscode.workspace.getConfiguration(configurationSection);
    const outConfig: Partial<IConfig> = {};

    withConfigValue(config, "tags", value => { outConfig.tags = value; });
    withConfigValue(config, "flavor", value => { outConfig.flavor = value; });
    withConfigValue(config, "ignoreImports", value => { outConfig.ignoreImports = value; });
    withConfigValue(config, "externalTagNames", value => { outConfig.externalTagNames = value; });

    return outConfig;
}


function withConfigValue(config: vscode.WorkspaceConfiguration, key: string, withValue: (value: any) => void): void {
    const configSetting = config.inspect(key);
    if (!configSetting) {
        return;
    }

    // Make sure the user has actually set the value.
    // VS Code will return the default values instead of `undefined`, even if user has not don't set anything.
    if (typeof configSetting.globalValue === 'undefined' && typeof configSetting.workspaceFolderValue === 'undefined' && typeof configSetting.workspaceValue === 'undefined') {
        return;
    }

    const value = config.get(key, undefined);
    if (typeof value !== 'undefined') {
        withValue(value);
    }
}