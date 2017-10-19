'use babel';

import MyEmacsModeView from './my-emacs-mode-view';
import { CompositeDisposable } from 'atom';

export default {

  myEmacsModeView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.myEmacsModeView = new MyEmacsModeView(state.myEmacsModeViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.myEmacsModeView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'my-emacs-mode:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.myEmacsModeView.destroy();
  },

  serialize() {
    return {
      myEmacsModeViewState: this.myEmacsModeView.serialize()
    };
  },

  toggle() {
    console.log('MyEmacsMode was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
