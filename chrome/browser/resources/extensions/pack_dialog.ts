// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import 'chrome://resources/cr_elements/cr_button/cr_button.js';
import 'chrome://resources/cr_elements/cr_dialog/cr_dialog.js';
import 'chrome://resources/cr_elements/cr_input/cr_input.js';
import './pack_dialog_alert.js';
import '/strings.m.js';

import type {CrDialogElement} from 'chrome://resources/cr_elements/cr_dialog/cr_dialog.js';
import type {CrInputElement} from 'chrome://resources/cr_elements/cr_input/cr_input.js';
import {CrLitElement} from 'chrome://resources/lit/v3_0/lit.rollup.js';

import {getCss} from './pack_dialog.css.js';
import {getHtml} from './pack_dialog.html.js';

export interface PackDialogDelegate {
  /**
   * Opens a file browser for the user to select the root directory.
   * @return A promise that is resolved with the path the user selected.
   */
  choosePackRootDirectory(): Promise<string>;

  /**
   * Opens a file browser for the user to select the private key file.
   * @return A promise that is resolved with the path the user selected.
   */
  choosePrivateKeyPath(): Promise<string>;

  /** Packs the extension into a .crx. */
  packExtension(rootPath: string, keyPath: string, flag?: number):
      Promise<chrome.developerPrivate.PackDirectoryResponse>;
}

class DummyPackDialogDelegate implements PackDialogDelegate {
  choosePackRootDirectory() {
    return Promise.resolve('');
  }

  choosePrivateKeyPath() {
    return Promise.resolve('');
  }

  packExtension(_rootPath: string, _keyPath: string, _flag?: number) {
    return Promise.resolve({
      message: '',
      item_path: '',
      pem_path: '',
      override_flags: 0,
      status: chrome.developerPrivate.PackStatus.SUCCESS,
    });
  }
}

export interface ExtensionsPackDialogElement {
  $: {
    dialog: CrDialogElement,
    keyFileBrowse: HTMLElement,
    keyFile: CrInputElement,
    rootDirBrowse: HTMLElement,
    rootDir: CrInputElement,
  };
}

export class ExtensionsPackDialogElement extends CrLitElement {
  static get is() {
    return 'extensions-pack-dialog';
  }

  static override get styles() {
    return getCss();
  }

  override render() {
    return getHtml.bind(this)();
  }

  static override get properties() {
    return {
      delegate: {type: Object},
      packDirectory_: {type: String},
      keyFile_: {type: String},
      lastResponse_: {type: Object},
    };
  }

  delegate: PackDialogDelegate = new DummyPackDialogDelegate();
  protected packDirectory_: string = '';
  protected keyFile_: string = '';
  protected lastResponse_: chrome.developerPrivate.PackDirectoryResponse|null =
      null;

  protected onKeyFileChanged_(e: CustomEvent<{value: string}>) {
    this.keyFile_ = e.detail.value;
  }

  protected onPackDirectoryChanged_(e: CustomEvent<{value: string}>) {
    this.packDirectory_ = e.detail.value;
  }

  protected onRootBrowse_() {
    this.delegate.choosePackRootDirectory().then(path => {
      if (path) {
        this.packDirectory_ = path;
      }
    });
  }

  protected onKeyBrowse_() {
    this.delegate.choosePrivateKeyPath().then(path => {
      if (path) {
        this.keyFile_ = path;
      }
    });
  }

  protected onCancelClick_() {
    this.$.dialog.cancel();
  }

  protected onConfirmClick_() {
    this.delegate.packExtension(this.packDirectory_, this.keyFile_, 0)
        .then(response => this.onPackResponse_(response));
  }

  /**
   * @param response The response from request to pack an extension.
   */
  private onPackResponse_(response:
                              chrome.developerPrivate.PackDirectoryResponse) {
    this.lastResponse_ = response;
  }

  /**
   * In the case that the alert dialog was a success message, the entire
   * pack-dialog should close. Otherwise, we detach the alert by setting
   * lastResponse_ null. Additionally, if the user selected "proceed anyway"
   * in the dialog, we pack the extension again with override flags.
   */
  protected onAlertClose_(e: Event) {
    e.stopPropagation();

    if (this.lastResponse_!.status ===
        chrome.developerPrivate.PackStatus.SUCCESS) {
      this.$.dialog.close();
      return;
    }

    // This is only possible for a warning dialog.
    if (this.shadowRoot!.querySelector(
                            'extensions-pack-dialog-alert')!.returnValue ===
        'success') {
      this.delegate
          .packExtension(
              this.lastResponse_!.item_path, this.lastResponse_!.pem_path,
              this.lastResponse_!.override_flags)
          .then(response => this.onPackResponse_(response));
    }

    this.lastResponse_ = null;
  }
}

// Exported to be used in the autogenerated Lit template file
export type PackDialogElement = ExtensionsPackDialogElement;

declare global {
  interface HTMLElementTagNameMap {
    'extensions-pack-dialog': ExtensionsPackDialogElement;
  }
}

customElements.define(
    ExtensionsPackDialogElement.is, ExtensionsPackDialogElement);
