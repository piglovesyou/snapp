import React from 'react';
import serialize from 'serialize-javascript';
import config from '@config@/config';
import { HtmlPropTypes } from '../app/types';

/* eslint-disable react/no-danger */

const Html = ({ styles = [], scripts = [], app, children }: HtmlPropTypes) => (
  <html className="no-js" lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {scripts.map(script => (
        <link key={script} rel="preload" href={script} as="script" />
      ))}

      <link rel="manifest" href="/site.webmanifest" />
      <link rel="apple-touch-icon" href="/icon.png" />
      {styles.map(style => (
        <style
          key={style.id}
          id={style.id}
          dangerouslySetInnerHTML={{ __html: style.cssText }}
        />
      ))}
    </head>
    <body>
      <div id="app" dangerouslySetInnerHTML={{ __html: children }} />
      <script
        dangerouslySetInnerHTML={{ __html: `window.App=${serialize(app)}` }}
      />

      {scripts.map(script => (
        <script key={script} src={script} />
      ))}

      {config.analytics.googleTrackingId && (
        <script
          dangerouslySetInnerHTML={{
            __html:
              'window.ga=function(){ga.q.push(arguments)};ga.q=[];ga.l=+new Date;' +
              `ga('create','${config.analytics.googleTrackingId}','auto');ga('send','pageview')`,
          }}
        />
      )}

      {config.analytics.googleTrackingId && (
        <script
          src="https://www.google-analytics.com/analytics.js"
          async
          defer
        />
      )}
    </body>
  </html>
);

export default Html;
