import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var originalInsertBefore = Node.prototype.insertBefore;
              Node.prototype.insertBefore = function(newNode, referenceNode) {
                if (newNode && newNode.nodeType === 1 && newNode.nodeName === 'BODY') {
                  var attrs = newNode.attributes;
                  for (var i = attrs.length - 1; i >= 0; i--) {
                    var attrName = attrs[i].name;
                    if (attrName.startsWith('data-gr-') || attrName.includes('-gr-')) {
                      newNode.removeAttribute(attrName);
                    }
                  }
                }
                return originalInsertBefore.call(this, newNode, referenceNode);
              };
            })();
          `
        }} />
      </body>
    </Html>
  )
} 