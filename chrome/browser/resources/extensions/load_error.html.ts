// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {html} from '//resources/lit/v3_0/lit.rollup.js';

import type {LoadErrorElement} from './load_error.js';

export function getHtml(this: LoadErrorElement) {
  // clang-format off
  return html`<!--_html_template_start_-->
<cr-dialog id="dialog" close-text="$i18n{close}">
  <div slot="title">$i18n{loadErrorHeading}</div>
  <div slot="body">
    <div id="info">
      <div id="file" class="description-row" ?hidden="${!this.file_}">
        <span class="row-label">$i18n{loadErrorFileLabel}</span>
        <span class="row-value">${this.file_}</span>
      </div>
      <div id="error" class="description-row">
        <span class="row-label">$i18n{loadErrorErrorLabel}</span>
        <span class="row-value">${this.error_}</span>
      </div>
    </div>
    <extensions-code-section id="code" .isActive="${this.isCodeSectionActive_}"
        .code="${this.codeSectionProperties_}"
        could-not-display-code="$i18n{loadErrorCouldNotLoadManifest}">
    </extensions-code-section>
  </div>
  <div slot="button-container">
    <div class="spinner" ?hidden="${!this.retrying_}"></div>
    <cr-button class="cancel-button" @click="${this.close}">
      $i18n{cancel}
    </cr-button>
    <cr-button class="action-button" ?disabled="${this.retrying_}"
        @click="${this.onRetryClick_}">
      $i18n{loadErrorRetry}
    </cr-button>
  </div>
</cr-dialog>
<!--_html_template_end_-->`;
  // clang-format on
}
