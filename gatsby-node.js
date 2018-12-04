const liSDK = require('@livingdocs/node-sdk')
const crypto = require('crypto')

exports.sourceNodes = async ({ actions }, configOptions) => {
  const { createNode } = actions

  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins

  // create a new livingdocs-client instance
  const liClient = new liSDK.Client({
    url: 'https://server.livingdocs.io',
    accessToken: configOptions.accessToken,
  })

  const limit = configOptions.limit ? configOptions.limit : 10

  // get all publications (articles, authors, etc.)
  const getAllPublications = () => {
    const publication = liClient
      .getPublications({ limit })
      .then(publications => publications)
    return publication
  }

  const getPublication = async content => {
    const livingdoc = await liSDK.document.create({
      content,
    })
    const article = liSDK.document.render(livingdoc)
    return article
  }

  const slugify = text =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[\s\W-]+/g, '-') // Replace spaces, non-word characters and dashes with a single dash (-)
      .replace(/-$/, '') // Remove last floating dash if exists

  // Create your node object
  const processPublication = async publication => {
    const html = await getPublication(publication.content)
    const nodeData = {
      id: `${publication.systemdata.documentId}`,
      parent: `__SOURCE__`,
      internal: {
        type: `Publications`, // name of the graphQL query --> allPublications {}
        contentDigest: crypto.createHash(`md5`).digest(`hex`),
      },
      children: [],
      publication, // the graphQL content, schema automatically created by gatsby
      extra: {
        slug: `${slugify(publication.metadata.title)}-${
          publication.systemdata.documentId
        }`,
        html,
      },
    }
    return nodeData
  }
  async function createNodes() {
    const allPublications = await getAllPublications()

    for (const publication of allPublications) {
      const nodeData = await processPublication(publication)
      createNode(nodeData)
    }
  }

  return await createNodes()
}
