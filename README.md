### What is this for?

This plugin enables you, to have a production ready Blog within one hour. You simply offload the manual-labor to this plugin.

Use-cases:

- small-medium Blogs
- small Magazines

For Enterprise use cases, this serves as a nice resource. This plugin is _not_ supposed to be used in _enterprise-production_ ready systems.

### Install

(soon)
`npm install --save gatsby-source-livingdocs`

### How to use

Add to your this plugin to your gatsby-config.js file and insert your accessToken.

@Todo: publish the npm module. For now, you have to add this to `plugins/gatsby-source-livingdocs` from root. Gatsby will search for any custom-plugins there.

```js
plugins: [
  {
    resolve: "gatsby-source-livingdocs",
    options: {
      limit: 35, // defaults to 10, maximum is 100
      accessToken: "your_livingdocs_token"
    }
  }
];
```

### How to query

Using GraphQL, you can query the nodes created from Livingdocs with the following schema at http://localhost:8000/___graphiql (unless you've set up custom configurations from within Livingdocs)

```{
  allPublications {
    edges {
      node {
        id
        extra {
          slug
          html
        }
        publication {
          systemdata {
            projectId
            channelId
            documentId
            contentType
            documentType
            layout
            design {
              name
              version
            }
          }
          metadata {
            title
            description
            flag
            teaserImage {
              originalUrl
            }
            publishDate
          }
          content {
            id
          }
        }
      }
    }
  }
}
```
