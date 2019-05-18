import {css,  customElement, LitElement, property } from "lit-element";
import "./my-button";

/**
 * Hejsa
 */
@customElement("my-component")
export class MyTest extends LitElement {
	/**
	 * Hello, this is some documentation
	 * @attr myProp1
	 */
	myProp1: string = "foo";

	myProp2: string = "bar";

	@property() myProp3?: string = "bar";

	@property() bar!: number;

	static get styles () {
		return css`
		a::part() {
		}
		`; 
	}

	static get properties() {
		return {
			/**
			 * Heheh
			 * @type {red|green}
			 */
			hello: { type: String }
		};
	}

	static get observedAttributes() {
		return ["myProp"];
	}
}
