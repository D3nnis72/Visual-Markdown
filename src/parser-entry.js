import { transform } from './core.js';
export default {
  onWillParseMarkdown: async (markdown) => transform(markdown, { today: new Date() }),
  onDidParseMarkdown: async (html) => html,
};
