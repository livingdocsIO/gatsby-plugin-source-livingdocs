const liSDK = require('@livingdocs/node-sdk')

module.exports = async function renderLayout (livingdoc, {layout}) {
  const wrapperLivingdoc = await liSDK.document.create({content: {}})

  const tree = wrapperLivingdoc.componentTree

  const layoutComponent = tree.createComponent('article-layout')

  const contentContainer = layoutComponent.containers.get('content')
  contentContainer.appendTree(livingdoc.componentTree)
  tree.append(layoutComponent)
  return liSDK.document.render(wrapperLivingdoc)
}
