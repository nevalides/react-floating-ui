import { forwardRef } from "react"

const MenuItem = forwardRef(({ label, disabled, ...props }, ref) => {
    return (
        <button
            {...props}
            className="w-full flex justify-between bg-[#242424] border-0 rounded-md text-base text-left hover:bg-gray-300 focus:bg-blue-600 focus:text-white active:bg-blue-600 active:text-white"
            ref={ref}
            role="menuItem"
            disabled={disabled}
        >
            {label}
        </button>
    )
})

export default MenuItem;
