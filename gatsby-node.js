const liSDK = require('@livingdocs/node-sdk')
const crypto = require('crypto')
const resolveIncludes = require('./includes')
const includesConfig = require('./includes/config')
const renderLayout = require('./includes/render')
const slugify = require('./slugify')

const documentTypes = {
  page: {
    layoutComponents: {
      layout: 'page-layout',
      header: 'page-layout-header',
      headerItem: 'page-layout-header-item',
      footer: 'page-layout-footer'
    }
  },
  article: {
    layoutComponents: {
      layout: 'article-layout',
      header: 'article-layout-header',
      headerItem: 'article-layout-header-item',
      footer: 'article-layout-footer'
    }
  }
}
const defaultDocumentType = {
  defaultDocumentType: {
    layoutComponents: {
      layout: 'default-layout',
      header: 'default-layout-header',
      headerItem: 'default-layout-header-item',
      footer: 'default-layout-footer'
    }
  }
}

exports.sourceNodes = async ({actions}, configOptions) => {
  const {createNode} = actions

  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins

  // create a new livingdocs-client instance
  const liClient = new liSDK.Client({
    url: 'https://server.livingdocs.io',
    accessToken: configOptions.accessToken
  })

  const limit = configOptions.limit ? configOptions.limit : 10

  // get all publications (articles, authors, etc.)
  const getAllPublications = () => {
    const publication = liClient.getPublications({limit}).then(publications => publications)
    return publication
  }

  const getPublication = async publication => {
    const livingdoc = await liSDK.document.create({
      content: publication.content
    })

    if (publication.systemdata.documentType === 'article') {
      await resolveIncludes(livingdoc, liClient, includesConfig)
      const documentType = publication.systemdata.documentType
      const currentDocumentType = documentTypes && documentTypes[documentType]
      const targetDocumentType = currentDocumentType || defaultDocumentType
      const layoutComponents = targetDocumentType.layoutComponents
      const html = await renderLayout(livingdoc, layoutComponents)

      return html
    } else {
      const article = liSDK.document.render(livingdoc)
      return article
    }
  }

  // Create your node object
  const processPublication = async publication => {
    const html = await getPublication(publication)
    const nodeData = {
      id: `${publication.systemdata.documentId}`,
      parent: `__SOURCE__`,
      internal: {
        type: `Publications`, // name of the graphQL query --> allPublications {}
        contentDigest: crypto.createHash(`md5`).digest(`hex`)
      },
      children: [],
      publication, // the graphQL content, schema automatically created by gatsby
      extra: {
        slug: slugify(publication.metadata.title, publication.systemdata.documentId),
        html
      }
    }
    return nodeData
  }
  async function createNodes () {
    const allPublications = await getAllPublications()

    for (const publication of allPublications) {
      const nodeData = await processPublication(publication)
      createNode(nodeData)
    }
  }

  return await createNodes()
}
