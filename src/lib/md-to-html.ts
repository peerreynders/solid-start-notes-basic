import { isServer } from 'solid-js/web';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// sanitize-html causes numerous warnings 
// for the client bundle, so DOMPurify is
// used for the client side instead.

function mdToHtml(mdText: string){
  const html = marked.parse(mdText);
  return isServer ? html : DOMPurify.sanitize(html);
}

export {
  mdToHtml
};
