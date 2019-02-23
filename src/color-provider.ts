import * as vscode from "vscode";
import { BUILT_IN_COLOR_REGEX, BUILT_IN_COLOR_MAP } from "./built-in-color-map";

const COLOR_HEX_REGEX = /#(?:[0-9a-fA-F]{3}){1,2}/gi

function hexToRGBA(hex: string): { r: number, g: number, b: number, a: number } | undefined {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);

	if (result != null) {
		return {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16),
			a: result[4] == null ? 255 : parseInt(result[4], 16),
		}
	}

	const shorthandResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
	if (shorthandResult != null) {
		return {
			r: parseInt(shorthandResult[1] + shorthandResult[1], 16),
			g: parseInt(shorthandResult[2] + shorthandResult[2], 16),
			b: parseInt(shorthandResult[3] + shorthandResult[3], 16),
			a: 255
		}
	}
}

function hexToVscodeColor(hex: string): vscode.Color | undefined {
	const rgba = hexToRGBA(hex);
	if (rgba == null) return undefined;
	return new vscode.Color(rgba.r, rgba.g, rgba.b, rgba.a);
}

function findColorsInDocument(document: vscode.TextDocument): vscode.ColorInformation[] {
	const text = document.getText();

	const colors: vscode.ColorInformation[] = [];

	// Find all hex colors in the document
	let match: RegExpExecArray | null = null;
	while ((match = COLOR_HEX_REGEX.exec(text)) != null) {
		const start = match.index;
		const hex = match[0];
		const color = hexToVscodeColor(hex);
		if (color == null) continue;

		colors.push(new vscode.ColorInformation(
			new vscode.Range(document.positionAt(start), document.positionAt(start + hex.length)),
			color
		));
	}

	// Find all built in colors in the document
	while ((match = BUILT_IN_COLOR_REGEX.exec(text)) != null) {
		const start = match.index;
		const colorName = match[0].toLowerCase();
		const hex = BUILT_IN_COLOR_MAP.get(colorName);
		if (hex == null) continue;

		const color = hexToVscodeColor(hex);
		if (color == null) continue;

		colors.push(new vscode.ColorInformation(
			new vscode.Range(document.positionAt(start), document.positionAt(start + hex.length)),
			color
		));
	}

	return colors;
}

export class ColorProvider implements vscode.DocumentColorProvider {

	provideDocumentColors(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ColorInformation[]> {
		return findColorsInDocument(document);
	}

	provideColorPresentations(color: vscode.Color, context: { document: vscode.TextDocument; range: vscode.Range; }, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ColorPresentation[]> {
		return [];
	}
}
