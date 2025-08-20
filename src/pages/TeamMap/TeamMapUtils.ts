export const searchTreeNodePath = (nodeId, parent) => {
  const stack = [[parent, []]]
  while (stack.length) {
    const [node, path] = stack.pop()
    if (node.id === nodeId) {
      return path
    }
    if (node.children) {
      stack.push(...node.children.map((node, index) => (
        [node, [...path, { index, id: node.id }]])
      ))
    }
  }
}

// const countItemsWithoutChildren = (item, count = 0) => {
//   if (item.children && item.children.length) {
//     return item.children.reduce((acc, item) => {
//       if (item.children && item.children.length) {
//         return countItemsWithoutChildren(item.children, count)
//       } else {
//         return acc + 1
//       }
//     }, count)
//   }
// }
const countItemsIncludingChildren = (item) => {
  if (!item) return 0

  // Count this item
  let count = 1  

  // Count all descendants
  if (item.children && item.children.length) {
    count += item.children.reduce(
      (acc, child) => acc + countItemsIncludingChildren(child),
      0
    )
  }

  return count
}
export const countLineParams = (
  item,
  index,
  hasItemBelow,
  marginBottom,
  itemHeight
) => {
  const baseHeight = itemHeight + marginBottom
  const nestedCount = countItemsIncludingChildren(item) || 0
  const top = itemHeight / 2

  let height
  if (hasItemBelow && nestedCount <= 1) {
    // if sibling exists but no real children
    height = baseHeight + 1
  } else {
    height = baseHeight * nestedCount + 1
  }

  return { top, height }
}
// export const countLineParams = (
//   item,
//   index,
//   hasItemBelow,
//   marginBottom,
//   itemHeight
// ) => {
//   const baseHeight = itemHeight + marginBottom
//   const nestedChildrenCount = countItemsWithoutChildren(item)
//   const top = itemHeight / 2
//   let height
//   if (hasItemBelow && !nestedChildrenCount) {
//     height = baseHeight + 1
//   } else {
//     height = baseHeight * nestedChildrenCount + 1
//   }
//   return { top, height }
// }
// export const countLineParams = (item, index, hasItemBelow, marginBottomDefault, itemHeightDefault) => {
//   const childrenCount = item.children?.length || 0;

//   if (childrenCount > 0) {
//     // Full line height = total children height + margins
//     const height = childrenCount * itemHeightDefault + (childrenCount - 1) * marginBottomDefault;
//     return { top: 0, height };
//   }

//   // Fallback to default single item logic
//   return {
//     top: 0,
//     height: hasItemBelow ? itemHeightDefault + marginBottomDefault : itemHeightDefault
//   };
// };
export const dropTreeNode = id => {

}

export const getTreeNode = (path = [], tree) => {

}
