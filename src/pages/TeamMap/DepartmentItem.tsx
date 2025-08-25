import React, { useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { countLineParams } from "./TeamMapUtils";
// import { countLineParams } from "./TeamMapUtils";

export const DepartmentItem = ({
  items,
  hasParent = false,
  level = 0,
  onItemClick,
  selectedPath,
  active = false,
  onItemDragStart,
  onItemDragEnd,
  onItemDrop,
  allItemsDraggable,
  itemNode: Component,
  marginBottomDefault = 10,
  itemHeightDefault = 160,
  searchItemPath,
  draggableId,
  setDraggableId,
  draggedOverId,
  setDraggedOverId
}) => {
  // const [draggedOverId, setDraggedOverId] = useState(null)
  ////debugger;
  const { length } = items;
  const isRoot = level === 0;

  const handleClick = (event, item) => {
    event.stopPropagation();
    onItemClick(item);
  };

  const handleStartDrag = (event, id) => {
    event.stopPropagation();
    onItemDragStart(id);
    setDraggableId(id);
  };

  const handleEndDrag = (event, id) => {
    event.stopPropagation();
    onItemDragEnd(id);
    setDraggableId(null);
    // setDraggedOverId(null)
  };

  const handleDragOver = (event, id, level) => {
    event.stopPropagation();
    const targetLevel = searchItemPath(id);
    if (!allItemsDraggable && level !== targetLevel + 1) {
      event.preventDefault();
      return false;
    }
    // if (id !== draggedOverId) {
    // setDraggedOverId(id)
    // }
  };

  const handleDropItem = (event, id) => {
    event.stopPropagation();
    onItemDrop(id);
  };

  return items.map((item, index) => {
    ////debugger;
    const { department_id,department_color } = item;
    const hasItemBelow = index < length - 1;
    const childrenCount = item.children && item.children.length;
    const { top, height } = countLineParams(
      item,
      index,
      hasItemBelow,
      marginBottomDefault,
      itemHeightDefault
    );
    const { id: activeId, index: activeIndex } = selectedPath[level] || {};
    const isActive = department_id === activeId;
    const isDraggable = allItemsDraggable ? "true" : !childrenCount;
    let marginBottom = marginBottomDefault;
    if (index === items.length - 1) {
      marginBottom = 0;
    }
    if (!level) {
      marginBottom = marginBottomDefault * 2;
    }
    // console.log({item: item.name, level})

    return (
      <div className="item" key={department_id} style={{ marginBottom ,}}>
        <div
          className={classNames("item__parent", {
            active: isActive
          })}
        >
          {!isRoot && hasItemBelow && (
            <div
              className={classNames("item__parent__line", {
                active: active && index < activeIndex
              })}
              style={{ top, height }}
            />
          )}
          <div
            onClick={(event) => handleClick(event, item)}
            className={classNames("item__parent__element", {
              "has-children": childrenCount,
              "has-parent": hasParent,
              "no-active-children": level === selectedPath.length - 1
            })}
            style={{ height: itemHeightDefault }}
          >
            {department_id && 
            <div
      className="absolute left-0  -translate-x-full 
                 w-0 h-0 
                 border-t-[6px] border-b-[6px] border-r-[8px]
                 border-t-transparent border-b-transparent border-r-black"
    ></div>}
            <Component
              onDragStart={(event) => handleStartDrag(event, department_id)}
              onDragEnd={(event) => handleEndDrag(event, department_id)}
              draggable={isDraggable}
              item={item}
            />
             
          </div>
        </div>
        <div
          id={department_id}
          // style={{ backgroundColor: id === draggedOverId ? 'aliceblue' : null }}
          className="item__children"
          onDrop={(event) => handleDropItem(event, department_id)}
          onDragOver={(event) => handleDragOver(event, department_id, level)}
        >
          {childrenCount > 0 && (
            <DepartmentItem
              items={item.children}
              hasParent
              level={level + 1}
              onItemClick={onItemClick}
              selectedPath={selectedPath}
              active={isActive}
              onItemDragStart={onItemDragStart}
              onItemDragEnd={onItemDragEnd}
              allItemsDraggable={allItemsDraggable}
              onItemDrop={onItemDrop}
              itemNode={Component}
              marginBottomDefault={marginBottomDefault}
              itemHeightDefault={itemHeightDefault}
              searchItemPath={searchItemPath}
              draggableId={draggableId}
              setDraggableId={setDraggableId}
              draggedOverId={draggedOverId}
              setDraggedOverId={setDraggedOverId}
            />
          )}
        </div>
      </div>
    );
  });
};

DepartmentItem.propTypes = {
  items: PropTypes.array,
  hasParent: PropTypes.bool
};
