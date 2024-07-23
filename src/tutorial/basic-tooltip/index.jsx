import { arrow, computePosition, flip, offset, shift } from "@floating-ui/react";

const button = document.querySelector("#button");
const tooltip = document.querySelector("#tooltip");
const arrowElement = document.querySelector('#arrow');

export const BasicTooltip = () => {
    computePosition(button, tooltip, {
        placement: 'top',
        middleware: [
          offset(6),
          flip(),
          shift({ padding: 5 }),
          arrow({ element: arrowElement })
        ]
      }).then(({ x, y, placement, middlewareData }) => {
        Object.assign(tooltip.style, {
          left: `${x}px`,
          top: `${y}px`
        });
    
        const { x: arrowX, y: arrowY } = middlewareData.arrow
    
        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[placement.split('-')[0]]
    
        Object.assign(arrowElement.style, {
          left: arrowX != null ? `${arrowX}px` : '',
          top: arrowY != null ? `${arrowY}px` : '',
          right: '',
          bottom: '',
          [staticSide]: '-4px',
        })
      });
    
      return (
        <div>
          <button
            id="button"
            aria-describedby="tooltip"
          >
            My Button
          </button>
          <div
            id="tooltip"
            className="w-max absolute top-0 left-0 bg-[#222] text-white font-bold p-1 rounded"
            style={{ fontSize: '90%' }}
            role="tooltip"
          >
            My Tooltip
          </div>
          <div
            id="arrow"
            className="absolute bg-[#222] w-2 h-2 rotate-45"
          />
        </div>
      )
}
