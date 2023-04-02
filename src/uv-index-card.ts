/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers

import type { UVIndexCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

import './editor';

/* eslint no-console: 0 */
console.info(
  `%c  UV-INDEX-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'uv-index-card',
  name: 'UV Index Card',
  preview: true,
  description: 'A Lovelace card that shows a the UV index and risk level for Home Assistant',
});

// TODO Name your custom element
@customElement('uv-index-card')
export class UVIndexCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    // await import('./editor');
    return document.createElement('uv-index-card-editor');
  }

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  // https://lit.dev/docs/components/properties/
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: UVIndexCardConfig;

  // https://lit.dev/docs/components/properties/#accessors-custom
  public setConfig(config: UVIndexCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'UV Index',
      ...config,
    };
  }

  // https://lit.dev/docs/components/lifecycle/#reactive-update-cycle-performing
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    const entityId = this.config.entity;
    const entityState = entityId ? this.hass.states[entityId] : undefined;
    const stateValue:number = entityState ? parseFloat(entityState.state) : 0;

    let uvRiskStr = 'uv_levels.low'
    if (stateValue >= 3 && stateValue < 6) {
      uvRiskStr = 'uv_levels.moderate'
    }
    if (stateValue >= 6 && stateValue < 8) {
      uvRiskStr = 'uv_levels.high'
    }
    if (stateValue >= 8 && stateValue < 11) {
      uvRiskStr = 'uv_levels.very_high'
    }
    if (stateValue >= 11) {
      uvRiskStr = 'uv_levels.extreme'
    }
    const colours = {
      idle: '#EDEDED',
      low: 'green', // #5B9F49
      moderate: 'yellow', // #FFFF00
      high: 'orange', // #FFA500
      veryHigh: 'red', // #FF0000
      extreme: 'blueviolet' // #8A2BE2
    }

    return html`
      <ha-card
        .header=${this.config.name}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        tabindex="0"
        .label=${`UV Index: ${this.config.entity || 'No Entity Defined'}`}
      >
        <div style="display: flex;">
          <div style="width: 50%; padding-left: 30px;">
            <svg width="162px" height="136px" viewBox="0 0 162 136" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <title>UV</title>
              <g id="UV-Index-Triangle" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <polygon points="81.9537723 2.99975159 77.2979826 10.4602611 86.4956236 10.4362484" fill="${stateValue >= 12 ? colours.extreme : colours.idle}"></polygon>
                <polygon points="92.8108692 20.7694268 70.8323051 20.8356688 76.2650231 12.1248408 87.5102538 12.0925478" fill="${stateValue >= 11 ? colours.extreme : colours.idle}"></polygon>
                <polygon points="99.1192621 31.0946561 64.3589492 31.2022994 69.7916672 22.4914713 93.8186467 22.4177771" fill="${stateValue >= 10 ? colours.veryHigh : colours.idle}"></polygon>
                <polygon points="105.434921 41.428828 57.8945103 41.5778726 63.3272282 32.8670446 100.134305 32.751121" fill="${stateValue >= 9 ? colours.veryHigh : colours.idle}"></polygon>
                <polygon points="111.751405 51.7620892 51.4218149 51.9450828 56.8627892 43.2334268 106.442533 43.0769299" fill="${stateValue >= 8 ? colours.veryHigh : colours.idle}"></polygon>
                <polygon points="118.058972 62.0882293 44.9567154 62.3192484 50.3894333 53.6092484 112.758356 53.4105223" fill="${stateValue >= 7 ? colours.high : colours.idle}"></polygon>
                <polygon points="124.367447 72.4134586 38.4834421 72.686707 43.9244164 63.975879 119.066832 63.7440318" fill="${stateValue >= 6 ? colours.high : colours.idle}"></polygon>
                <polygon points="130.17996 81.9276369 32.5388267 82.2331783 37.4513908 74.3512038 125.38216 74.0696752" fill="${stateValue >= 5 ? colours.moderate : colours.idle}"></polygon>
                <polygon points="136.495618 92.2528662 26.0661313 92.6006369 31.4988492 83.8889809 131.195003 83.5759873" fill="${stateValue >= 4 ? colours.moderate : colours.idle}"></polygon>
                <polygon points="142.804011 102.58621 19.6010318 102.96793 25.0337497 94.2562739 137.503396 93.9093312" fill="${stateValue >= 3 ? colours.moderate : colours.idle}"></polygon>
                <polygon points="149.111661 112.912268 13.1285841 113.342841 18.5613021 104.632013 143.819302 104.242013" fill="${stateValue >= 2 ? colours.low : colours.idle}"></polygon>
                <polygon points="155.427732 123.23758 6.66373231 123.717834 12.0964503 115.007006 150.127117 114.560701" fill="${stateValue >= 1 ? colours.low : colours.idle}"></polygon>
                <polygon points="5.62342462 125.373554 0.999834872 132.792662 161.264189 132.792662 156.435014 124.893299" fill="${colours.low}"></polygon>
              </g>
            </svg>
          </div>
          <div>
            <div>
              <p>
                <span style="font-weight: bold;">${localize('common.uv_index')}</span><br/>
                ${stateValue}
              </p>
            </div>
            <div>
              <p>
                <span style="font-weight: bold;">${localize('common.uv_risk')}</span><br/>
                ${localize(uvRiskStr)}
              </p>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html` <hui-warning>${warning}</hui-warning> `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html` ${errorCard} `;
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return css``;
  }
}
