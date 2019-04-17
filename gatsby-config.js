const queries = require('./src/utils/algolia');
require('dotenv').config();

module.exports = {
  siteMetadata: {
    title: 'Interactor.js',
    description: 'Composable, immutable, asynchronous way to interact with DOM.',
    author: '@wilwilsman'
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-catch-links',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'content',
        path: `${__dirname}/src/content`
      }
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        tableOfContents: {
          maxDepth: 2
        },
        plugins: [
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              showLineNumbers: true,
              noInlineHighlight: true
            }
          },
          'gatsby-remark-autolink-headers',
          'gatsby-remark-widows',
          'gatsby-remark-block-link',
          'gatsby-remark-tabbed',
          'gatsby-remark-hint'
        ]
      }
    },
    {
      resolve: 'gatsby-plugin-postcss',
      options: {
        postCssPlugins: [
          require('autoprefixer'),
          require('precss')
        ]
      }
    },
    {
      resolve: 'gatsby-plugin-typography',
      options: {
        pathToConfigModule: 'src/utils/typography'
      }
    },
    {
      resolve: 'gatsby-plugin-algolia',
      options: {
        appId: process.env.GATSBY_ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_ADMIN_KEY,
        chunkSize: 10000,
        queries
      }
    },
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: process.env.GOOGLE_ANALYTICS_TRACKING_ID
      }
    }
    // 'gatsby-plugin-offline',
  ]
};
